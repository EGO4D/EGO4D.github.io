import torch
import base64

from jinja2 import Template
from bokeh.embed import components
from io import BytesIO

from plot_utils import get_column_data_from_features, get_plot


def to_png(image):
    out = BytesIO()
    image.save(out, format='png')
    return out.getvalue()


def svg_image(svg_string):
    return f'data:image/svg+xml;utf-8,{svg_string}'


def encode_images(images):
    urls = []
    for im in images:
        png = to_png(im)
        url = 'data:image/png;base64,'
        url += base64.b64encode(png).decode('utf-8')
        urls.append(url)
    return urls


if __name__ == '__main__':

    entries = torch.load('data/entries.pth')
    feat_2d = torch.load('data/umap_feat.pth')

    # Constants
    H, W = 1120, 1792
    mult = 1
    node_sz = mult * 32
    H, W = H*mult, W*mult
    show_frac = 0.2
    tooltip_sz = 256

    src = get_column_data_from_features(
        feat_2d, entries,
        H, W,
        node_sz, tooltip_sz,
        show_frac=show_frac,
        background=False,
        max_items=2000)

    p = get_plot(
        src,
        H, W,
        node_sz, sz=tooltip_sz,
        background=False)

    # TODO: Render CDN, Script etc from Bokeh embed library
    # Right now, it is copy pasted from output of running them once

    script, div = components(p)

    template = Template('''<!DOCTYPE html >
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Ego4d</title>
    <script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-2.3.0.min.js" integrity="sha384-HjagQp6T0/7bxYTAXbLotF1MLAGWmhkY5siA1Gc/pcEgvgRPtMsRn0gQtMwGKiw1" crossorigin="anonymous"></script>
    <script type="text/javascript">
        Bokeh.set_log_level("info");
    </script>
    <style>
        .bk-root .bk-tooltip {
            opacity: 1 !important; }
    </style>
</head>
<body>
    {{ div }}
</body>
{{ script }}
</html >''')
    filename = 'fig1.html'

    html = template.render(div=div, script=script)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
