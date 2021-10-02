from PIL import Image
from autocrop import Cropper
import numpy as np
import cv2

#== Parameters =======================================================================
BLUR = 21
CANNY_THRESH_1 = 100
CANNY_THRESH_2 = 200
MASK_DILATE_ITER = 8
MASK_ERODE_ITER = 15
MASK_COLOR = (0.0,0.0,0.0) # In BGR format


img = cv2.imread('./assets/sample-photos/elon.jpg')
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
cv2.imwrite('./out/masked.png', img_a*255)

cropper = Cropper(width=80, height=100, face_percent=100)

# Get a Numpy array of the cropped image
cropped_array = cropper.crop('./out/masked.png')

# Save the cropped image with PIL if a face was detected:
if len(cropped_array) > 0:
    cropped_image = Image.fromarray(cropped_array)
    cropped_image.save('./out/cropped.png')
