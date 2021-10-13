import json
import numpy as np

from pathlib import Path

from PIL import Image
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
from scipy.optimize import linear_sum_assignment

from bokeh.plotting import figure, ColumnDataSource
from bokeh.models.tools import HoverTool, WheelZoomTool, PanTool, SaveTool

DATA_FOLDER = Path('frames_round')
CLUSTER_FILE = Path('./cluster.json')
ASSET_URL = "https://assets.ego4d-data.org/plot-images"

univ_color_map = {
    'unict': '#1a237e',
    'bristol': '#00589b',
    'mit': '#548b30',
    'cmu': '#fed602',
    'upenn': '#817618',
    'frl_track_1_public': '#890e4f',
    'iiith': '#394aab',
    'losandes': '#0a7138',
    'cmuafrica': '#6739b7',
    'georgiatech': '#f9a825',
    'utokyo': '#c2165b',
    'minnesota': '#a52714',
    'nus': '#ff5252',
    'kaust': '#0097a7',
    'indiana': '#e65200',
}

univ_name_map = {
    'unict': 'UNICT',
    'bristol': 'Bristol',
    'mit': 'MIT',
    'cmu': 'CMU',
    'upenn': 'UPenn',
    'frl_track_1_public': 'Facebook',
    'iiith': 'IIITH',
    'losandes': 'Los Andes',
    'cmuafrica': 'CMU Africa',
    'georgiatech': 'GaTech',
    'utokyo': 'UTokyo',
    'minnesota': 'UMinnesota',
    'nus': 'NUS',
    'kaust': 'KAUST',
    'indiana': 'Indiana',
}

scenario_map = {
    "Gardening": "Gardening",
    "Making a salad/sandwich": "Making a salad/sandwich",
    "Ironing": "Ironing",
    "Visiting exhibition": "Visiting exhibition",
    "Car/scooter washing": "Car/scooter washing",
    "Walking the dog / pet": "Walking the dog / pet",
    "Cooking": "Cooking",
    "Bus": "Bus",
    "Fixing musical instrument": "Fixing musical instrument",
    "Cleaning at the gym": "Cleaning at the gym",
    "Video call": "Video call",
    "Working out outside": "Working out outside",
    "Bike": "Bike",
    "Indoor Navigation (walking)": "Indoor Navigation (walking)",
    "Handyman": "Handyman",
    "On a screen (phone/laptop)": "On a screen (phone/laptop)",
    "Attending a party": "Attending a party",
    "Maker Lab (making items in different materials, wood plastic and also electronics), some overlap with construction etc. but benefit is all activities take place within a few rooms": "Maker Lab",
    "Hair and Makeup stylist": "Hair and Makeup stylist",
    "DEPRECATED : Playing board games": "Playing board games",
    "Hosting a party": "Hosting a party",
    "Blacksmith": "Blacksmith",
    "Household cleaners": "Household cleaners",
    "Outdoor social (includes campfire)": "Outdoor social (includes campfire)",
    "Assembling a puzzle": "Assembling a puzzle",
    "Practicing a musical instrument": "Practicing a musical instrument",
    "Watching movies at the cinema": "Watching movies at the cinema",
    "Working out at home": "Working out at home",
    "Playing cards": "Playing cards",
    "Street art": "Street art",
    "Dancing": "Dancing",
    "Playing badminton": "Playing badminton",
    "Daily hygiene": "Daily hygiene",
    "Eating at a friend's home": "Eating at a friend's home",
    "Attending religious activity": "Attending religious activity",
    "Sleeping": "Sleeping",
    "Going to the park": "Going to the park",
    "Roller skating": "Roller skating",
    "Car mechanic": "Car mechanic",
    "Mini golf": "Mini golf",
    "biology experiments": "biology experiments",
    "Participating in a meeting": "Participating in a meeting",
    "Walking on street": "Walking on street",
    "Talking with family members": "Talking with family members",
    "Bike mechanic": "Bike mechanic",
    "Football": "Football",
    "Fixing PC": "Fixing PC",
    "Swimming in a pool/ocean": "Swimming in a pool/ocean",
    "Table tennis": "Table tennis",
    "Talking on the phone": "Talking on the phone",
    "Playing board games": "Playing board games",
    "Outdoor technical climbing/belaying/rappelling (includes ropework)": "Outdoor climbing/belaying/rappelling",
    "Carpenter": "Carpenter",
    "Baker": "Baker",
    "Cleaning / laundry": "Cleaning / laundry",
    "Reading books": "Reading books",
    "Hanging out with friends at a bar": "Hanging out with friends at a bar",
    "Attending a festival or fair": "Attending a festival or fair",
    "Hiking": "Hiking",
    "Making Bricks": "Making Bricks",
    "Going to the gym - exercise machine, class, weights": "Going to the gym",
    "Golfing": "Golfing",
    "Drone flying": "Drone flying",
    "Fixing something in the home": "Fixing something in the home",
    "Rowing": "Rowing",
    "Clothes, other shopping": "Clothes, other shopping",
    "Making coffee": "Making coffee",
    "Farmer": "Farmer",
    "Gaming arcade / pool / billiards": "Gaming arcade / pool / billiards",
    "Cycling / jogging": "Cycling / jogging",
    "BBQ'ing/picnics": "BBQ'ing/picnics",
    "Talking with friends/housemates": "Talking with friends/housemates",
    "Eating": "Eating",
    "Talking to colleagues": "Talking to colleagues",
    "Pulp Traces Factory (Egges)": "Pulp Traces Factory (Egges)",
    "Playing games / video games": "Playing games / video games",
    "Working at desk": "Working at desk",
    "Play with cellphone": "Play with cellphone",
    "Gardener": "Gardener",
    "Washing the dog / pet, grooming horse": "Washing the dog / pet, grooming horse",
    "Car - commuting, road trip": "Car - commuting, road trip",
    "Baseball": "Baseball",
    "jobs related to construction/renovation company\n(Director of work, tiler, plumber, Electrician, Handyman, etc)": "Construction/renovation jobs",
    "Going to a salon (nail, hair, spa)": "Going to a salon (nail, hair, spa)",
    "Attending a lecture/class": "Attending a lecture/class",
    "Potting plants (indoor)": "Potting plants (indoor)",
    "Drive-thru food": "Drive-thru food",
    "building lego models / plastic models": "building lego models / plastic models",
    "Yoga practice": "Yoga practice",
    "Scooter mechanic": "Scooter mechanic",
    "Outdoor cooking": "Outdoor cooking",
    "Watching tv": "Watching tv",
    "Eating at a restaurant": "Eating at a restaurant",
    "Listening to music": "Listening to music",
    "Eating at the cafeteria": "Eating at the cafeteria",
    "Reviewing flash cards": "Reviewing flash cards",
    "Electronics (hobbyist circuitry board kind, not electrical repair)": "Electronics",
    "Writing on whiteboard": "Writing on whiteboard",
    "Taking photos in photography studio": "Taking photos in photography studio",
    "Grocery shopping indoors": "Grocery shopping indoors",
    "Working in milktea shop": "Working in milktea shop",
    "Household management - caring for kids": "Household management - caring for kids",
    "Frisbee": "Frisbee",
    "Crafting/knitting/sewing/drawing/painting": "Crafting/knitting/sewing/drawing/painting",
    "Doing hair/make-up": "Doing hair/make-up",
    "Attending sporting events - watching and participating in": "Attending sporting events",
    "Preparing hopot": "Preparing hopot",
    "BasketBall": "BasketBall",
    "Hanging out at a coffee shop": "Hanging out at a coffee shop",
    "Riding motorcycle": "Riding motorcycle",
    "Playing with pets": "Playing with pets",
    "Fishing": "Fishing",
    "Camp setup/pack-up/chores": "Camp setup/pack-up/chores",
    "Getting car fixed": "Getting car fixed",
    "Assembling furniture": "Assembling furniture",
    "Labwork": "Labwork",
    "Eating in a canteen": "Eating in a canteen",
    "Skateboard/scooter": "Skateboard/scooter",
    "Attending a TA session": "Attending a TA session",
    "Working in outdoor store": "Working in outdoor store",
    "Doing yardwork / shoveling snow": "Doing yardwork / shoveling snow",
    "Snow sledding": "Snow sledding",
    "Eating in hawker center": "Eating in hawker center"
}


# https://stackoverflow.com/a/63886256
def get_even_clusters(X, cluster_size):
    n_clusters = int(np.ceil(len(X)/cluster_size))
    kmeans = KMeans(n_clusters)
    kmeans.fit(X)
    centers = kmeans.cluster_centers_
    centers = centers.reshape(-1, 1, X.shape[-1]).repeat(
        cluster_size, 1).reshape(-1, X.shape[-1])
    distance_matrix = cdist(X, centers)
    clusters = linear_sum_assignment(distance_matrix)[1]//cluster_size
    return clusters


def compute_clusters(features, clip_uids):
    # We group by 100 elements
    cluster_assignment = get_even_clusters(features, 100)
    cluster_map = {}
    for idx, k in enumerate(cluster_assignment):
        if k not in cluster_map:
            cluster_map[k] = []

        cluster_map[k].append(idx)

    # Create as numpy array for vectorized operations
    cluster_xindex = np.zeros((len(features), ), dtype=np.int32)
    cluster_yindex = np.zeros((len(features), ), dtype=np.int32)

    for k in cluster_map:
        # For each cluster group, create the big image
        _arr = cluster_map[k]

        # Write images to {k}.jpg, scaling each patch down to 256 x 256
        im_sz = 256
        image_canvas = Image.new("RGB", (10*im_sz, 10*im_sz))
        for idx, el in enumerate(_arr):
            _uid = clip_uids[el]
            with Image.open(f'frames_square/{_uid}_square.png') as im:
                offset_x = (idx % 10) * im_sz
                offset_y = (idx // 10) * im_sz
                image_canvas.paste(im.resize((im_sz, im_sz)),
                                   (offset_x, offset_y))

        image_canvas.save(f'{k}.jpg', quality=80)

        # return the offsets on the background image
        cluster_xindex[_arr] = [
            f'{(x % 10)}' for x in range(0, len(_arr))]
        cluster_yindex[_arr] = [
            f'{(x // 10)}' for x in range(0, len(_arr))]

    return cluster_assignment.tolist(), cluster_xindex.tolist(), cluster_yindex.tolist()


def get_clusters(x, y, clip_uids):

    # TODO: Stable hashing
    features = np.column_stack((x, y))
    features_hash = hash(features.tostring())

    try:
        cluster_json = json.loads(CLUSTER_FILE.read_bytes())
        json_hash = cluster_json['hash']
        if features_hash != json_hash:
            raise Exception("Hashes don't match")
        # nothing to do. Return the cluster assignments
        return cluster_json['cluster_assignment'], cluster_json['cluster_xindex'], cluster_json['cluster_yindex']
    except Exception as e:
        print(f'Exception when reading clusters: {e}')
        print('Recomputing')

        # Compute everything and save
        a, x, y = compute_clusters(features, clip_uids)
        CLUSTER_FILE.touch(exist_ok=True)
        CLUSTER_FILE.write_text(json.dumps({
            'hash': features_hash,
            'cluster_assignment': a,
            'cluster_xindex': x,
            'cluster_yindex': y,
        }))
        return a, x, y


def load_and_encode_frame(clip_uid, node_sz):
    im_sz = 64
    with Image.open(DATA_FOLDER / f'{clip_uid}_round.png') as im:
        img = np.empty((im_sz, im_sz), dtype=np.uint32)
        view = img.view(dtype=np.uint8).reshape(
            (im_sz, im_sz, 4))
        view[:, :, :] = np.flipud(np.asarray(
            im.resize((im_sz, im_sz)).convert('RGBA')))
    return img


def get_column_data_from_features(
        feat_2d,
        entries,
        H, W,
        node_sz, tooltip_sz,
        show_frac=1.0,
        background=False,
        max_items=2000):

    x_min, x_max = feat_2d[:, 0].min(), feat_2d[:, 0].max()
    y_min, y_max = feat_2d[:, 1].min(), feat_2d[:, 1].max()
    x = (feat_2d[:, 0] - x_min)/(x_max-x_min) * W
    y = (feat_2d[:, 1] - y_min)/(y_max-y_min) * H
    if background:
        x, y = x - node_sz//2, y - node_sz//2

    rs = np.random.RandomState(404)
    subset_idx = rs.choice(range(len(entries)), int(
        show_frac*len(entries)), replace=False)
    subset_entries = [entries[idx] for idx in subset_idx]
    x, y = x[subset_idx], y[subset_idx]

    viz_slice = slice(0, max_items)
    subset_entries = np.array(subset_entries)[viz_slice].tolist()
    x, y = x[viz_slice], y[viz_slice]

    if background:
        round_urls = [load_and_encode_frame(
            entry['clip_uid'], node_sz) for entry in subset_entries]
        data = dict(
            x=x,
            y=y,
            round_urls=round_urls
        )
    else:

        source_words = [', '.join(entry['bow'][:20])
                        for entry in subset_entries]
        source_univs = [univ_name_map[entry['video_source']]
                        for entry in subset_entries]
        source_scenarios = [scenario_map[entry['scenarios'][0]]
                            for entry in subset_entries]

        clip_uids = [entry['clip_uid'] for entry in subset_entries]
        cluster_assignment, cluster_xindex, cluster_yindex = get_clusters(
            x, y, clip_uids)

        # convert cluster index to pixel offsets
        cluster_xindex = [f'-{tooltip_sz * x}px' for x in cluster_xindex]
        cluster_yindex = [f'-{tooltip_sz * x}px' for x in cluster_yindex]
        data = dict(
            x=x,
            y=y,
            cluster_xindex=cluster_xindex,
            cluster_yindex=cluster_yindex,
            cluster_assignment=cluster_assignment,
            source_words=source_words,
            source_univ=source_univs,
            source_scenario=source_scenarios,
        )

    return ColumnDataSource(data)


def get_plot(src, H, W, node_sz, sz=256, background=False):

    # Tooltip will scale the background to the provided size and offsets
    # assuming a 10 x 10 grid of images
    fontsize = 16
    TOOLTIP = f'''
<div style="width: 100%; overflow: hidden;">
    <div style="width: {sz}px; height: {sz}px; float: left; background: url('{ASSET_URL}/@cluster_assignment.jpg') @cluster_xindex @cluster_yindex/{sz * 10}px {sz * 10}px no-repeat ">
    </div>
    <div style="margin-left: {sz+20}px;>
    <ul style="list-style-type:none;">
        <li style="width: {sz}px; font-size: {fontsize}px"><b>Source:</b> @source_univ</li>
        <li style="width: {sz}px; font-size: {fontsize}px"><b>Scenario:</b> @source_scenario</li>
        <li style="width: {sz}px; font-size: {fontsize}px"><b>Topic:</b> @source_words</li>
    </ul>
    </div>
</div>
'''
    TOOLS = [WheelZoomTool(), PanTool(), SaveTool(),
             HoverTool(tooltips=TOOLTIP)]

    p = figure(
        tools=TOOLS,
        x_range=(-node_sz, W+node_sz), y_range=(-node_sz, H+node_sz),
        plot_width=W + 2*node_sz,
        plot_height=H + 2*node_sz,
        output_backend="canvas",
    )

    if background:
        p.image_rgba(
            source=src,
            image='round_urls',
            x='x',
            y='y',
            dw=node_sz,
            dh=node_sz,
            dw_units='screen',
            dh_units='screen',
        )
        p.background_fill_color = None
        p.min_border = 0
        p.border_fill_color = None
        p.outline_line_color = None

        p.toolbar.logo = None
        p.toolbar_location = None
    else:
        p.circle('x', 'y', size=node_sz, source=src,
                 fill_alpha=0.0, line_alpha=0.0)

        p.image_url(
            url=[f'{ASSET_URL}/plot.png'],
            x=-node_sz,
            y=-node_sz,
            w=W+2*node_sz,
            h=H+2*node_sz,
            w_units='data',
            h_units='data',
            anchor='bottom_left',
        )

    p.xaxis.visible = False
    p.yaxis.visible = False
    p.xgrid.grid_line_color = None
    p.ygrid.grid_line_color = None

    return p
