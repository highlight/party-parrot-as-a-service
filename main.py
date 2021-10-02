from PIL import Image
from autocrop import Cropper

cropper = Cropper(width=80, height=100, face_percent=100)

# Get a Numpy array of the cropped image
cropped_array = cropper.crop('./assets/sample-photos/elon.jpeg')

# Save the cropped image with PIL if a face was detected:
if len(cropped_array) > 0:
    cropped_image = Image.fromarray(cropped_array)
    cropped_image.save('./out/cropped.png')
