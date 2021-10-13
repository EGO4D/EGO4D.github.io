// TODO: Get image bounds from JSON / Image directly
const w = 1652;
const h = 1024;
const ar = w / h;

const ASSET_URL = 'https://assets.ego4d-data.org/videos';
const videos = {
    'Bristol': {
        'prefix': 'bristol',
        'count': 9,
        'logo': 'assets/images/bristol-min.png',
    },
    'Minnesota': {
        'prefix': 'minnesota',
        'count': 8,
        'logo': 'assets/images/UMN.png',
    },
    'Georgia tech': {
        'prefix': 'georgiatech',
        'count': 4,
        'logo': 'assets/images/GT.png',
    },
    'NUS': {
        'prefix': 'nus',
        'count': 8,
        'logo': 'assets/images/NUS.jpeg',
    },
    'CMU': {
        'prefix': 'cmu',
        'count': 8,
        'logo': 'assets/images/cmu-wordmark-stacked-r.png',
    },
    'Catania': {
        'prefix': 'catania',
        'count': 10,
        'logo': 'assets/images/catania-min.png',
    },
    'CMU Africa': {
        'prefix': 'cmuafrica',
        'count': 8,
        'logo': 'assets/images/CMU-Africa.png',
    },
    'King Abdullah': {
        'prefix': 'kaust',
        'count': 8,
        'logo': 'assets/images/KAUST_logo_for_Digital_Media_Large-01.png',
    },
    'IIIT Hyd': {
        'prefix': 'iiith',
        'count': 10,
        'logo': 'assets/images/iiit-new.png',
    },
    'Tokyo': {
        'prefix': 'tokyo',
        'count': 8,
        'logo': 'assets/images/University_of_Tokyo_Logo-700x181.png',
    },
    'Los Andes': {
        'prefix': 'losandes',
        'count': 9,
        'logo': 'assets/images/Uniandes-logo.jpeg',
    },
    'Indiana': {
        'prefix': 'indiana',
        'count': 0,
        'logo': 'assets/images/IUB.png',
    },
    'Pennsylvania': {
        'prefix': 'upenn',
        'count': 0,
        'logo': 'assets/images/U-Penn.png',
    },
    'MIT': {
        'prefix': 'mit',
        'count': 0,
        'logo': 'assets/images/MIT2.jpg',
    },
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function shuffle(max) {
    // https://stackoverflow.com/a/12646864
    // https://blog.codinghorror.com/the-danger-of-naivete/
    let arr =  [...Array(max).keys()];
    for (let i = max - 1; i > 0; i--) {
        let n = getRandomInt(i + 1);
        [arr[i], arr[n]] = [arr[n], arr[i]];
    }
    return arr;
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
    let currentIndex = {};
    let permutation = {};

    video.oncanplay = () => {
        const video_ar = video.videoWidth / video.videoHeight;
        tooltip.style.width = `${video_ar * 360}px`;
        video.classList.add('fade-in');
        video.play();
    }
    video.onended = () => {
        video.classList.remove('fade-in');

        if (!(currentMarker in videos)) {
            video.src = '';
            tooltip.style.width = '480px'
        } else {
            const { count: _count, prefix: _prefix } = videos[currentMarker];
            if (_count > 0) {
                const _p = permutation[currentMarker];
                const _cidx = (currentIndex[currentMarker] + 1) % _count;
                const vidx = _p[_cidx];

                video.src = `${ASSET_URL}/${_prefix}/${vidx + 1}.mp4`;
                currentIndex[currentMarker] = _cidx;
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

        if (!(marker in videos)) {
            video.src = '';
            tooltip.style.width = '480px'
        } else {
            const { count: _count, prefix: _prefix } = videos[marker];
            if (_count > 0) {
                if (!(currentMarker in permutation)) {
                    permutation[currentMarker] = shuffle(_count);
                    currentIndex[currentMarker] = 0;
                }
                const _p = permutation[currentMarker];
                const _cidx = (currentIndex[currentMarker] + 1) % _count;
                const vidx = _p[_cidx];

                video.src = `${ASSET_URL}/${_prefix}/${vidx + 1}.mp4`;
                currentIndex[currentMarker] = _cidx;
            } else {
                video.src = '';
                tooltip.style.width = '480px'
            }
        }
        video.load();
        tooltip.style.background = `white url(${videos[marker]['logo']}) 50% 50%/contain no-repeat`;
        tooltip.classList.remove("gone");

    };
    let user_disabled = false;

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
        if (ph < 512 || pw < 1024) {
            parallax.onmousemove = null;
            parallax.onclick = (e) => {
                if (e.target !== parallax) {
                    return;
                }
                user_disabled = !user_disabled;
                parallax.classList.toggle('paused');
            }
            return;
        }
        parallax.onmousemove = onmousemove;
        parallax.onclick = null;
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
        parallax.classList.add('paused');
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
        if (!user_disabled) {
            parallax.classList.remove('paused');
        }
        window.addEventListener('resize', resizeListener, false);
        resizeListener();
        enabled = true;
    }

    return [enable, disable];
}








