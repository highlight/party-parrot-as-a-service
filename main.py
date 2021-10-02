from PIL import Image
from autocrop import Cropper
import numpy as np
import cv2

#== Parameters =======================================================================
BLUR = 21
CANNY_THRESH_1 = 10
CANNY_THRESH_2 = 200
MASK_DILATE_ITER = 10
MASK_ERODE_ITER = 10
MASK_COLOR = (0.0,0.0,1.0) # In BGR format
IMAGE_HEIGHT = 100
IMAGE_WIDTH = 80

def maskForeground(inputPath, outputPath):
	img = cv2.imread(inputPath)
	gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)

	#-- Edge detection -------------------------------------------------------------------
	edges = cv2.Canny(gray, CANNY_THRESH_1, CANNY_THRESH_2)
	edges = cv2.dilate(edges, None)
	edges = cv2.erode(edges, None)

	#-- Find contours in edges, sort by area ---------------------------------------------
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

	#-- Create empty mask, draw filled polygon on it corresponding to largest contour ----
	# Mask is black, polygon is white
	mask = np.zeros(edges.shape)
	cv2.fillConvexPoly(mask, max_contour[0], (255))

	#-- Smooth mask, then blur it --------------------------------------------------------
	mask = cv2.dilate(mask, None, iterations=MASK_DILATE_ITER)
	mask = cv2.erode(mask, None, iterations=MASK_ERODE_ITER)
	mask = cv2.GaussianBlur(mask, (BLUR, BLUR), 0)
	mask_stack = np.dstack([mask]*3)    # Create 3-channel alpha mask

	#-- Blend masked img into MASK_COLOR background --------------------------------------
	mask_stack  = mask_stack.astype('float32') / 255.0          # Use float matrices,
	img         = img.astype('float32') / 255.0                 #  for easy blending

	masked = (mask_stack * img) + ((1-mask_stack) * MASK_COLOR) # Blend
	masked = (masked * 255).astype('uint8')                     # Convert back to 8-bit

	c_red, c_green, c_blue = cv2.split(img)
	img_a = cv2.merge((c_red, c_green, c_blue, mask.astype('float32') / 255.0))
	cv2.imwrite(outputPath, img_a*255)

def cropToFace(inputPath, outputPath):
	cropper = Cropper(width=IMAGE_WIDTH, height=IMAGE_HEIGHT, face_percent=100)

	# Get a Numpy array of the cropped image
	cropped_array = cropper.crop(inputPath)

	# Save the cropped image with PIL if a face was detected:
	if len(cropped_array) > 0:
		cropped_image = Image.fromarray(cropped_array)
		cropped_image.save(outputPath)

def addOvalMask(inputPath, outputPath):
	img = cv2.imread(inputPath)
	center = (int(IMAGE_WIDTH/2), int(IMAGE_HEIGHT/2))
	radius = min(center[0], center[1], IMAGE_WIDTH-center[0], IMAGE_HEIGHT-center[1])
	Y, X = np.ogrid[:IMAGE_HEIGHT, :IMAGE_WIDTH]
	dist_from_center = np.sqrt((X - center[0])**2 + ((Y/1.3)-center[0])**2)

	mask = dist_from_center <= radius

	masked_img = img.copy()
	masked_img[~mask] = 0

	tmp = cv2.cvtColor(masked_img, cv2.COLOR_BGR2GRAY)
	_,alpha = cv2.threshold(tmp,0,255,cv2.THRESH_BINARY)
	b, g, r = cv2.split(masked_img)
	rgba = [b,g,r, alpha]
	dst = cv2.merge(rgba,4)
	cv2.imwrite(outputPath, dst)

maskForeground('./assets/sample-photos/cameron.png', './out/masked.png')
cropToFace('./out/masked.png', './out/cropped.png')
addOvalMask('./out/cropped.png', './out/oval.png')
