from pypdf import PdfReader
import sys

try:
    reader = PdfReader("VERTICAL-15.pdf")
    extracted = False
    for page in reader.pages:
        for image_file_object in page.images:
            # We save it as logo.png or logo.jpg depending on the original, 
            # but let's just force a known name if we can, or just print it.
            name = "new_logo." + image_file_object.name.split(".")[-1]
            with open(name, "wb") as fp:
                fp.write(image_file_object.data)
            print(f"Extracted {name}")
            extracted = True
    if not extracted:
        print("No images found in PDF")
except Exception as e:
    print(f"Error: {e}")
