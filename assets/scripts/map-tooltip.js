// TODO: Get image bounds from JSON / Image directly
const w = 1652;
const h = 1024;
const ar = w / h;

const videos = {
    'Bristol': {
        'videos': ['assets/videos/bristol/1.mp4'],
        'logo': 'assets/images/bristol-min.png',
    },
    'Fb': {
        'videos': ['assets/videos/fair/1.mp4'],
        'logo': 'assets/images/fair_logo.png',
    },
    'Minnesota': {
        'videos': ['assets/videos/minnesota/1.mp4'],
        'logo': 'assets/images/UMN.png',
    },
    'Georgia tech': {
        'videos': ['assets/videos/georgiatech/1.mp4'],
        'logo': 'assets/images/GT.png',
    },
    'NUS': {
        'videos': ['assets/videos/nus/1.mp4'],
        'logo': 'assets/images/NUS.jpeg',
    },

    'CMU': {
        'videos': ['assets/videos/cmu/1.mp4'],
        'logo': 'assets/images/cmu-wordmark-stacked-r.png',
    },

    'Catania': {
        'videos': ['assets/videos/catania/1.mp4'],
        'logo': 'assets/images/catania-min.png',
    },
    'CMU Africa': {
        'videos': ['assets/videos/cmuafrica/1.mp4'],
        'logo': 'assets/images/CMU-Africa.png',
    },
    'King Abdullah': {
        'videos': ['assets/videos/kaust/1.mp4'],
        'logo': 'assets/images/KAUST_logo_for_Digital_Media_Large-01.png',
    },
    'IIIT Hyd': {
        'videos': ['assets/videos/iiith/1.mp4'],
        'logo': 'assets/images/iiit-new.png',
    },
    'Tokyo': {
        'videos': ['assets/videos/tokyo/1.mp4'],
        'logo': 'assets/images/University_of_Tokyo_Logo-700x181.png',
    },
    'Indiana': {
        'videos': [],
        'logo': 'assets/images/IUB.png',
    },
    'Pennsylvania': {
        'videos': [],
        'logo': 'assets/images/U-Penn.png',
    },
    'MIT': {
        'videos': [],
        'logo': 'assets/images/MIT2.jpg',
    },
    'Los Andes': {
        'videos': [],
        'logo': 'assets/images/Uniandes-logo.jpeg',
    },
}

function map_hover(tooltip, video, parallax) {
    if (!window || !window.innerWidth || !window.innerHeight) {
        return;
    }
    // Disable map hover if bbox falls outside.

    let pw = window.innerWidth,
    ph = window.innerHeight;
    let iw = w,
        ih = h;
    let iscale = 1;
    let mx, my, Mx, My, markers;
    let currentMarker = null;
    let currentIndex = 0;

    video.oncanplay = () => {
        const video_ar = video.videoWidth / video.videoHeight;
        tooltip.style.width = `${video_ar * 360}px`;
        video.classList.add('fade-in');
        video.play();
    }
    video.onended = () => {
        video.classList.remove('fade-in');
        currentIndex = (currentIndex + 1) % 10;
        if (!(currentMarker in videos)) {
            video.src = '';
            tooltip.style.width = '480px'
        } else {
            const vfile = videos[currentMarker]['videos'];
            if (vfile.length > 0) {
                video.src = vfile[currentIndex % vfile.length];
            } else {
                video.src = '';
                tooltip.style.width = '480px'
            }
        }
        video.load();
    }

    const dom2img = (x, y) => {
        return [x + (iw - pw) / 2, y + (ih - ph) / 2].map((el) => el / iscale);
    };
    const img2dom = (x, y) => {
        const [sx, sy] = [x, y].map((el) => el * iscale);
        return [sx - (iw - pw) / 2, sy - (ih - ph) / 2];
    };

    // WARNING: Assuming BOUNDS is defined
    let dom_markers = Object.fromEntries(
        Object.entries(BOUNDS).map(([k, v]) => {
        const [x1, y1, x2, y2] = v;
        return [k, [...img2dom(x1, y1), ...img2dom(x2, y2)]];
        })
    );

    const find_intersection = (x, y) => {
        return Object.entries(markers).find(([marker, bbox]) => {
            const [x1, y1, x2, y2] = bbox;
            if (x < x1 || y < y1 || x >= x2 || y >= y2) {
                return false;
            }
            return true;
        });
    };
    const onmousemove = (e) => {
        const [x, y] = [e.clientX, e.clientY];
        if (x < mx || x > Mx || y < my || y > My) {
            tooltip.classList.add("gone");
            video.classList.remove('fade-in');
            video.pause();
            currentMarker = null;
            return;
        }
        const intersection = find_intersection(x, y);
        if (!intersection) {
            tooltip.classList.add("gone");
            video.classList.remove('fade-in');
            video.pause();
            currentMarker = null;
            return;
        }

        const [marker, bbox] = intersection;
        const [x1, y1, x2, y2] = bbox;


        if (currentMarker === marker) {
            // Already playing
            return;

        }
        currentMarker = marker;
        if (x1 > pw / 2) {
            tooltip.style.right = `${pw - x1}px`;
            tooltip.style.left = "auto";
        } else {
            tooltip.style.left = `${x2}px`;
            tooltip.style.right = "auto";
        }
        // TODO 360 is hardcoded, should depend on video
        const VW = 360;
        const top = (y1 + y2) / 2;

        tooltip.style.top = `${Math.round(Math.min(Math.max(8, ph*0.6 - VW - 8), Math.max(8, top - VW / 2)))}px`;
        tooltip.style.bottom = `auto`;

        video.classList.remove('fade-in');


        video.pause();
        if (marker in videos) {
            const vfile = videos[marker]['videos'];
            if (vfile.length > 0) {
                video.src = vfile[currentIndex % vfile.length];
            } else {
                video.src = '';
                tooltip.style.width = '480px'

            }
        } else {
            video.src = ''
            tooltip.style.width = '480px'
        }
        video.load();
        tooltip.style.background = `white url(${videos[marker]['logo']}) 50% 50%/contain no-repeat`;
        tooltip.classList.remove("gone");

    };

    const calculateImageDims = () => {
        let par = pw / ph;
        if (par < ar) {
            ih = ph;
            iw = ph * ar;
            iscale = ph / h;
        } else {
            iw = pw;
            ih = pw / ar;
            iscale = pw / w;
        }
        dom_markers = Object.fromEntries(
            Object.entries(BOUNDS).map(([k, v]) => {
                const [x1, y1, x2, y2] = v;
                return [k, [...img2dom(x1, y1), ...img2dom(x2, y2)]];
            })
        );

        [mx, my, Mx, My] = dom_markers["bbox"];
        markers = { ...dom_markers };
        delete markers["bbox"];
        if (ph < 768 || pw < 1025) {
            parallax.onmousemove = null;
            return;
        }
        parallax.onmousemove = onmousemove;
        // if (mx < 0 || Mx >= pw || my < 0 || My >= ph) {
        //     parallax.onmousemove = onmousemove;
        // } else {
        //     parallax.onmousemove = onmousemove;
        // }
    };
    const resizeListener = () => {
        pw = window.innerWidth;
        ph = window.innerHeight;
        calculateImageDims();
    }

    let enabled = false;
    const disable = () => {
        if (!enabled) {
            return;
        }
        window.removeEventListener('resize', resizeListener, false);
        parallax.onmousemove = null;
        tooltip.classList.add('gone');
        video.classList.remove('fade-in');
        video.pause();
        video.src = '';
        video.load();
        currentMarker = null;
        enabled = false;
    }
    const enable = () => {
        if (enabled) {
            return;
        }
        window.addEventListener('resize', resizeListener, false);
        resizeListener();
        enabled = true;
    }

    return [enable, disable];
}








