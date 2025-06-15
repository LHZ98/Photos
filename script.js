const imageContainer = document.getElementById('gallery');
let index = 0;
let loading = false;
const batchSize = 10; // The number of images loaded per batch
const initialBatchCount = 5; // The number of batches initially loaded
const scrolldistance = 1000; // The distance from the bottom of the page to start loading more images
let currentImageIndex = 0;
let loadedImages = [];
let leftArrow;
let rightArrow;

// Calculate the number of days since the start date
function calculateLoveDays() {
    const loveDateStr = document.getElementById('loveDate').innerText.trim();
    // 把 2024.06.15 转成 2024-06-15
    const startDate = new Date(loveDateStr.replace(/\./g, '-'));
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const timeDiff = today - startDate;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    document.getElementById('loveDays').innerText = days;
}

// Load images in batches when the user scrolls to the bottom of the page
async function loadImages(batchCount = 1) {
    if (loading) return;
    loading = true;

    for (let b = 0; b < batchCount; b++) {
        const batchPromises = [];
        for (let i = 0; i < batchSize; i++) {
            batchPromises.push(loadThumbnail(index));
            index++;
        }
        const results = await Promise.all(batchPromises);

        results.forEach((img) => {
            if (img) imageContainer.appendChild(img);
        });

        const loadMore = results.some((img) => img);

        if (!loadMore) {
            window.removeEventListener('scroll', handleScroll);
            console.log('All images have been loaded and displayed.');
            break;
        }
    }
    loading = false;
}

// Load a thumbnail image and create an image element
function loadThumbnail(index) {
    return new Promise((resolve) => {
        const thumbImg = new Image();
        thumbImg.crossOrigin = 'Anonymous';
        const thumbPath = `Images/thumbs/${index}.jpg`;
        const fullPath = `Images/${index}.jpg`;
        console.log('Trying to load thumbnail:', thumbPath);
        thumbImg.src = thumbPath;

        thumbImg.onload = function () {
            console.log('Successfully loaded thumbnail:', thumbPath);
            createImageElement(thumbImg, index, resolve);
        };

        // If the thumbnail image fails to load, try loading the full-size image
        thumbImg.onerror = function () {
            console.log('Failed to load thumbnail, trying full image:', fullPath);
            thumbImg.src = fullPath;
            thumbImg.onload = function () {
                console.log('Successfully loaded full image:', fullPath);
                createImageElement(thumbImg, index, resolve);
            };
            thumbImg.onerror = function () {
                console.log('Failed to load both thumbnail and full image for index:', index);
                resolve(null);
            };
        };

        function createImageElement(thumbImg, index, resolve) {
            const imgElement = document.createElement('img');
            imgElement.dataset.large = `Images/${index}.jpg`;
            imgElement.src = thumbImg.src;
            imgElement.alt = `Image ${index}`;
            imgElement.setAttribute('data-date', '');
            imgElement.setAttribute('data-index', index);

            EXIF.getData(thumbImg, function () {
                let exifDate = EXIF.getTag(this, 'DateTimeOriginal');
                if (exifDate) {
                    exifDate = exifDate.replace(/^(\d{4}):(\d{2}):(\d{2}).*$/, '$1.$2.$3');
                } else {
                    exifDate = '';
                }
                imgElement.setAttribute('data-date', exifDate);

                loadedImages[index] = {
                    src: imgElement.dataset.large,
                    date: exifDate,
                };
            });

            imgElement.addEventListener('click', function () {
                showPopup(imgElement.dataset.large, imgElement.getAttribute('data-date'), index);
            });

            imgElement.style.cursor = 'pointer';
            imgElement.classList.add('thumbnail');

            resolve(imgElement);
        }
    });
}

// 图片描述占位符，每张图片都可以单独编辑
const captions = [
    "大西洋城的海边，一个很适合求婚的地方",
    "mini golf第一lhz，倒第一hjh",
    "真的可爱呀，怎么能是搭讪的借口呢",
    "还没在一起就已经开始吃醋呢，真是醋精",
    "我老婆最爱喝的水果冰沙",
    "真是一盘秀色可餐的清炒花菜",
    "不和我一起吃，装高冷，难搞的女人",
    "第一次给老婆买早餐，真是个好男人",
    "第一次一起看电影，可太好看了",
    "斯人若彩虹，遇上方知有",
    "我最爱的鞋，真的是太酷辣",
    "Catskills的合照，很怀念啊",
    "美丽的老婆和还没发福的我",
    "合照+1",
    "背着我和yyx密谋一些不可告人的事情",
    "东边日出西边雨，道是无晴却有晴",
    "抽烟并不能抑制我对你的思念",
    "生日快乐呀我的宝，爱你爱你",
    "我宝自认的颜值巅峰，真是云想衣裳花想容，春风拂槛露华浓",
    "但愿人长久，千里共婵娟",
    "是什么让一个年轻的帅小伙在一年内苍老成这样，究竟是人性的扭曲，还是道德的沦丧",
    "Cornell的五人行，完美的旅行，完美的友情，完美的爱情",
    "一张美丽的照片，我拍的",
    "一张闭眼的照片，我拍的",
    "两张闭眼的照片，咱也不懂，咱也不敢问",
    "虽然有点小丑，但是和你在一起的每一天都特别开心",
    "画画大师lhz，配色大师hjh",
    "开始加州旅行啦，我宝路线规划真的好，忍不住再次感叹",
    "17miles~",
    "不可描述，真是太变态了",
    "你也很变态，怪不得咱俩是一对呢",
    "简略讲述了hjh追lhz的经过",
    "02/13/2025 - 06/15/2025 - forever",
    "美丽的火烈鸟，美丽的我的老婆",
    "每当晚霞映红天际，我都仿佛看见你回眸的笑颜",
    "天阶夜色凉如水，卧看牵牛织女星",
    "文艺才女hjh",
    "愿我们的感情像彩虹一样新鲜而绚烂",
    "HJH❤️LHZ！",
    "没事来顿小烧烤，太香了，吃完再吵个小架，完美",
    "我排队的时候还在看你，而你却在玩手机，这就是爱和不爱的区别吗😢",
    "错过了攒够彩礼钱的大好机会，血亏",
    "不知道说啥了，那就祝我们永远幸福吧",
    "记一次7人的旅行，我觉得不如咱俩出去玩",
    "去年拍鸭子还是搭讪，今年拍鸭子是要给老婆每天汇报我的日常",
];

// Display a popup with the full-size image
function showPopup(src, date, index) {
    currentImageIndex = index;
    const popup = document.getElementById('popup');
    const popupImg = document.getElementById('popupImg');
    const imgDate = document.getElementById('imgDate');
    const photoCaption = document.getElementById('photoCaption');

    popup.style.display = 'block';

    popupImg.style.display = 'none';
    imgDate.innerText = '';
    // 设置描述文字
    photoCaption.innerText = captions[index] || '';

    // 图片加载逻辑
    const fullImg = new Image();
    fullImg.crossOrigin = 'Anonymous';
    fullImg.src = src;

    fullImg.onload = function () {
        popupImg.src = src;
        popupImg.style.display = 'block';
        imgDate.innerText = date;
    };

    fullImg.onerror = function () {
        imgDate.innerText = 'Load failed';
    };

    leftArrow.style.display = 'flex';
    rightArrow.style.display = 'flex';

    if (currentImageIndex > 0) {
        leftArrow.classList.remove('disabled');
    } else {
        leftArrow.classList.add('disabled');
    }

    if (loadedImages[currentImageIndex + 1]) {
        rightArrow.classList.remove('disabled');
    } else {
        rightArrow.classList.add('disabled');
    }
}

// Close the popup
function closePopup() {
    const popup = document.getElementById('popup');
    const popupImg = document.getElementById('popupImg');
    const imgDate = document.getElementById('imgDate');
    popup.style.display = 'none';
    popupImg.src = '';
    imgDate.innerText = '';

    leftArrow.style.display = 'none';
    rightArrow.style.display = 'none';
}

// Load the previous image
function handleScroll() {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - scrolldistance) {
        loadImages();
    }
}

// Show the previous image in the popup (when the left arrow is clicked)
function showPreviousImage() {
    const prevIndex = currentImageIndex - 1;
    if (prevIndex >= 0) {
        if (loadedImages[prevIndex]) {
            currentImageIndex = prevIndex;
            const imgData = loadedImages[prevIndex];
            showPopup(imgData.src, imgData.date, prevIndex);
        } else {
            leftArrow.classList.add('disabled');
        }
    }
}

// Show the next image in the popup (when the right arrow is clicked)
function showNextImage() {
    const nextIndex = currentImageIndex + 1;
    if (loadedImages[nextIndex]) {
        currentImageIndex = nextIndex;
        const imgData = loadedImages[nextIndex];
        showPopup(imgData.src, imgData.date, nextIndex);
    } else {
        rightArrow.classList.add('disabled');
    }
}

// Keyboard navigation for the popup
window.addEventListener('keydown', function (event) {
    const popup = document.getElementById('popup');
    if (popup.style.display === 'block') {
        if (event.key === 'ArrowLeft') {
            showPreviousImage();
        } else if (event.key === 'ArrowRight') {
            showNextImage();
        } else if (event.key === 'Escape') {
            closePopup();
        }
    }
});

// Load the initial images and set up event listeners
window.onload = function () {
    calculateLoveDays();

    loadImages(initialBatchCount).then(() => {
        window.addEventListener('scroll', handleScroll);
    });

    document.getElementById('closeBtn').addEventListener('click', closePopup);

    leftArrow = document.getElementById('leftArrow');
    rightArrow = document.getElementById('rightArrow');

    leftArrow.addEventListener('click', showPreviousImage);
    rightArrow.addEventListener('click', showNextImage);

    leftArrow.style.display = 'none';
    rightArrow.style.display = 'none';
};
