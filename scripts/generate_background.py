import torch

from bokeh.io import export_png
from plot_utils import get_column_data_from_features, get_plot

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
        background=True,
        max_items=2000
    )

    p = get_plot(
        src,
        H, W,
        node_sz, sz=tooltip_sz,
        background=True)

    export_png(p, filename="plot.png")
