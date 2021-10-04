from PIL import Image
import glob
from autocrop import Cropper
import numpy as np
import cv2
from flask import Flask, request
import time
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import requests
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# == Parameters =======================================================================
BLUR = 21
CANNY_THRESH_1 = 10
CANNY_THRESH_2 = 200
MASK_DILATE_ITER = 10
MASK_ERODE_ITER = 10
MASK_COLOR = (0.0, 0.0, 1.0)  # In BGR format
IMAGE_HEIGHT = 90
IMAGE_WIDTH = 70


def maskForeground(inputPath, outputPath):
    img = cv2.imread(inputPath)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # -- Edge detection -------------------------------------------------------------------
    edges = cv2.Canny(gray, CANNY_THRESH_1, CANNY_THRESH_2)
    edges = cv2.dilate(edges, None)
    edges = cv2.erode(edges, None)

    # -- Find contours in edges, sort by area ---------------------------------------------
    contour_info = []
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    for c in contours:
        contour_info.append((
            c,
            cv2.isContourConvex(c),
            cv2.contourArea(c),
        ))
    contour_info = sorted(contour_info, key=lambda c: c[2], reverse=True)
    max_contour = contour_info[0]

    # -- Create empty mask, draw filled polygon on it corresponding to largest contour ----
    # Mask is black, polygon is white
    mask = np.zeros(edges.shape)
    cv2.fillConvexPoly(mask, max_contour[0], (255))

    # -- Smooth mask, then blur it --------------------------------------------------------
    mask = cv2.dilate(mask, None, iterations=MASK_DILATE_ITER)
    mask = cv2.erode(mask, None, iterations=MASK_ERODE_ITER)
    mask = cv2.GaussianBlur(mask, (BLUR, BLUR), 0)
    mask_stack = np.dstack([mask]*3)    # Create 3-channel alpha mask

    # -- Blend masked img into MASK_COLOR background --------------------------------------
    mask_stack = mask_stack.astype(
        'float32') / 255.0          # Use float matrices,
    img = img.astype('float32') / 255.0  # for easy blending

    masked = (mask_stack * img) + ((1-mask_stack) * MASK_COLOR)  # Blend
    # Convert back to 8-bit
    masked = (masked * 255).astype('uint8')

    c_red, c_green, c_blue = cv2.split(img)
    img_a = cv2.merge((c_red, c_green, c_blue, mask.astype('float32') / 255.0))
    cv2.imwrite(outputPath, img_a*255)


def cropToFace(inputPath, outputPath):
    cropper = Cropper(width=IMAGE_WIDTH, height=IMAGE_HEIGHT, face_percent=90)

    # Get a Numpy array of the cropped image
    cropped_array = cropper.crop(inputPath)

    # Save the cropped image with PIL if a face was detected:
    if cropped_array is not None and len(cropped_array) > 0:
        cropped_image = Image.fromarray(cropped_array)
        cropped_image.save(outputPath)
        return True
    return False


def addOvalMask(inputPath, outputPath):
    img = cv2.imread(inputPath)
    center = (int(IMAGE_WIDTH/2), int(IMAGE_HEIGHT/2))
    radius = min(center[0], center[1], IMAGE_WIDTH -
                 center[0], IMAGE_HEIGHT-center[1])
    Y, X = np.ogrid[:IMAGE_HEIGHT, :IMAGE_WIDTH]
    dist_from_center = np.sqrt((X - center[0])**2 + ((Y/1.3)-center[0])**2)

    mask = dist_from_center <= radius

    masked_img = img.copy()
    masked_img[~mask] = 0

    tmp = cv2.cvtColor(masked_img, cv2.COLOR_BGR2GRAY)
    _, alpha = cv2.threshold(tmp, 0, 255, cv2.THRESH_BINARY)
    b, g, r = cv2.split(masked_img)
    rgba = [b, g, r, alpha]
    dst = cv2.merge(rgba, 4)
    cv2.imwrite(outputPath, dst)


def overlay_image_alpha(img, img_overlay, x, y, alpha_mask):
    """Overlay `img_overlay` onto `img` at (x, y) and blend using `alpha_mask`.

    `alpha_mask` must have same HxW as `img_overlay` and values in range [0, 1].
    """
    # Image ranges
    y1, y2 = max(0, y), min(img.shape[0], y + img_overlay.shape[0])
    x1, x2 = max(0, x), min(img.shape[1], x + img_overlay.shape[1])

    # Overlay ranges
    y1o, y2o = max(0, -y), min(img_overlay.shape[0], img.shape[0] - y)
    x1o, x2o = max(0, -x), min(img_overlay.shape[1], img.shape[1] - x)

    # Exit if nothing to do
    if y1 >= y2 or x1 >= x2 or y1o >= y2o or x1o >= x2o:
        return

    # Blend overlay within the determined ranges
    img_crop = img[y1:y2, x1:x2]
    img_overlay_crop = img_overlay[y1o:y2o, x1o:x2o]
    alpha = alpha_mask[y1o:y2o, x1o:x2o, np.newaxis]
    alpha_inv = 1.0 - alpha

    img_crop[:] = alpha * img_overlay_crop + alpha_inv * img_crop


def createFrames(facePath, outputPath):
    FRAME_PATHS = ['./assets/frames/1.png',
                   './assets/frames/2.png', './assets/frames/3.png', './assets/frames/4.png', './assets/frames/5.png', './assets/frames/6.png']
    FACE_POSITIONS = [(18, 5), (16, 15), (23, 25), (35, 15), (34, 5), (25, 0)]
    face = np.array(Image.open(facePath))

    for index, framePath in enumerate(FRAME_PATHS):
        frame = np.array(Image.open(framePath))
        alpha_mask = face[:, :, 3] / 255.0
        img_result = frame[:, :, :3].copy()
        img_overlay = face[:, :, :3]

        x, y = FACE_POSITIONS[index]
        overlay_image_alpha(img_result, img_overlay, x, y, alpha_mask)

        # Save result
        Image.fromarray(img_result).save(f"{outputPath}/frame-{index}.png")


def createGif():
    img, *imgs = [Image.open(f)
                  for f in sorted(glob.glob('./out/frames/*.png'))]
    img.save(fp='./out/party-parrot.gif', format='GIF', append_images=imgs,
             save_all=True, duration=60, loop=0)


def uploadGifToStorage():
    filename = f"{int(time.time())}.gif"
    resp = supabase.storage().StorageFileAPI('party-parrots').upload(f'party-parrots/{filename}', './out/party-parrot.gif', {
        "content-type": "image/gif",
    })
    return f'https://gbpohqmsjdcrrrwshczg.supabase.in/storage/v1/object/public/{resp.json()["Key"]}'


def resizeImage(inputPath, outputPath):
    img = cv2.imread(inputPath)
    dim = (IMAGE_WIDTH, IMAGE_HEIGHT)

    # resize image
    resized = cv2.resize(img, dim, interpolation=cv2.INTER_AREA)
    cv2.imwrite(outputPath, resized)


app = Flask(__name__)


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/party", methods=['POST'])
def create_party_parrot():
    filename = f"{int(time.time())}.png"
    if len(request.files) == 0:
        imageToDownload = request.form['url']
        response = requests.get(imageToDownload)
        file = open(os.path.join(app.root_path,
                    'out', 'uploads', filename), "wb")
        file.write(response.content)
        file.close()
    else:
        image = request.files['image']
        image.save(os.path.join(app.root_path, 'out', 'uploads', filename))

    maskForeground(f'./out/uploads/{filename}', './out/masked.png')
    if not cropToFace('./out/masked.png', './out/cropped.png'):
        resizeImage(f'./out/uploads/{filename}', './out/cropped.png')
    addOvalMask('./out/cropped.png', './out/oval.png')
    createFrames('./out/oval.png', './out/frames')
    createGif()
    url = uploadGifToStorage()

    os.remove(f"./out/uploads/{filename}")
    return url


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
