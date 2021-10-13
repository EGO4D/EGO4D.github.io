### Script to generate the Bokeh plot and assets

#### Pre-requisites

1. TSNE Features and Attributes (`entries.pth` and `umap_feat.pth`)
2. `frames_round` & `frames_square` folder of images images


#### Setup

Tested on Ubuntu, but can be adapted to other platforms
```bash
cd scripts

# Make sure you have python3 installed

# Download the prerequisites mentioned above
# Place the pth files in `data` folder

# Install the requirements
pip install -r requirements.txt

# Generate the background plot - this will create plot.png
python3 generate_background.py

# Generate the main html page
# This will create fig1.html and the associated background images named 0-19.jpg
# These images will be used to show thumbnail on hover.
python3 generate_html.py

# Push the generated plot.png, 0-19.jpg to the website assets S3 bucket and invalidate the cloudfront cache
```