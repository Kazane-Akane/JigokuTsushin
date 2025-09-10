document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submitBtn');
    const targetNameInput = document.getElementById('targetName');

    // 开场动画元素
    const introDiv = document.getElementById('intro');
    const introVideo = document.getElementById('introVideo');
    const mainContentDiv = document.getElementById('main-content');
    const popupContainer = document.getElementById('popupContainer');

    // 新增：为标题添加故障效果类
    const mainTitle = document.querySelector('.container h1');
    mainTitle.classList.add('glitch-text');

    // 新增：检查是否已达成契约的标记
    //const contractCompleted = localStorage.getItem('jigoku_tsushin_contract_completed');

    // 新增：404 页面显示函数
    function show404Page() {
        document.body.innerHTML = '';
        const bgm = document.querySelector('audio');
        if (bgm) {
            bgm.pause();
            bgm.currentTime = 0;
        }
        document.body.classList.add('four-oh-four');
        document.body.innerHTML = `
            <div class="error-content">
                <h1>404</h1>
                <p>ページは存在しません</p>
            </div>
        `;
    }

    // 新增：时间判断逻辑
 function checkTimeAndContract() {
        // 如果 URL 包含 /admin，则无视所有限制
        if (window.location.pathname.includes('/admin')) {
            return true;
        }

        // 获取东京当前时间
        const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
        const hour = now.getHours();
        const minute = now.getMinutes();

        // 检查时间是否在 00:00 到 00:10 之间
        const isTimeValid = (hour === 0 && minute >= 0 && minute <= 10);

        // 如果时间无效或者契约已完成，直接显示404页面
        if (!isTimeValid || contractCompleted) {
            show404Page();
            return false;
        }
        return true;
    }

    // 在页面加载时立即执行判断
    if (!checkTimeAndContract()) {
        return; // 如果条件不满足，停止执行后续代码
    }

    // 动态创建随机位置的彼岸花
    function createRandomLycoris() {
        const totalLycoris = 1000;
        for (let i = 0; i < totalLycoris; i++) {
            const lycoris = document.createElement('div');
            lycoris.classList.add('lycoris');

            // 随机位置
            const x = Math.random() * 100;
            const size = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 5;

            lycoris.style.left = `${x}vw`;
            lycoris.style.width = `${size}px`;
            lycoris.style.height = `${size}px`;
            lycoris.style.animationDelay = `${delay}s`;
            lycoris.style.animationDuration = `${duration}s`;

            document.body.appendChild(lycoris);
        }
    }

    // 假设开场视频的播放时间可以作为 introDuration 的参考，或者设定一个固定值
    const introDuration = 3000;

    // 创建并准备BGM
    const bgm = new Audio('https://kazane-akane.github.io/JigokuTsushin/BGM.m4a');
    bgm.loop = true;
    bgm.volume = 0.5;

    // 监听视频播放结束事件
    if (introVideo) {
        introVideo.addEventListener('ended', () => {
            introVideo.classList.add('hidden');
            setTimeout(() => {
                introDiv.style.opacity = '0';
                setTimeout(() => {
                    introDiv.classList.add('hidden');
                    mainContentDiv.classList.remove('hidden');
                    introDiv.style.pointerEvents = 'none';
                    createRandomLycoris();
                }, 500);
            }, 2000);
        });
    }

    // 新增：噪音音频部分
    const staticNoise = new Audio('noise.mp3'); // 确保此文件存在于网站目录中
    let isNoisePlaying = false;
    const audioDuration = 15; // 音频总长度为15秒
    const playDuration = 2; // 播放时长为2秒

    // 新增：效果列表
    const visualEffects = ['invert-effect', 'tv-static'];

    function playRandomStaticNoise() {
        // 频繁触发，80%的几率
        if (Math.random() < 0.8 && !isNoisePlaying) {
            isNoisePlaying = true;

            // 随机选择开始时间，确保有足够的时长来播放2秒
            const maxStartTime = audioDuration - playDuration;
            const startTime = Math.random() * maxStartTime;

            // 随机选择并应用一个效果
            const randomEffect = visualEffects[Math.floor(Math.random() * visualEffects.length)];
            document.body.classList.add(randomEffect);

            // 在播放噪音前0.5秒添加反色效果
            setTimeout(() => {
                // document.body.classList.add('invert-effect'); // 移除旧的固定效果
                staticNoise.currentTime = startTime;
                staticNoise.volume = 0.5;
                staticNoise.play().catch(e => {
                    console.error("噪音播放失败:", e);
                    isNoisePlaying = false;
                    // 如果播放失败，也要移除反色效果
                    // document.body.classList.remove('invert-effect');
                    document.body.classList.remove(randomEffect); // 移除随机效果
                });
            }, 500);

            // 2.5秒后（噪音播放2秒 + 提前0.5秒），停止播放并移除反色效果
            setTimeout(() => {
                staticNoise.pause();
                staticNoise.currentTime = 0;
                isNoisePlaying = false;
                // 移除反色效果
                document.body.classList.remove(randomEffect);
            }, (playDuration + 0.5) * 1000);
        }
    }

    // 新增：循环播放噪音的函数
    function startPeriodicNoise() {
        // 每5到15秒随机播放一次噪音
        const randomDelay = Math.random() * (15000 - 5000) + 5000;
        setTimeout(() => {
            // 1% 的几率触发关机效果
            if (Math.random() < 0.01) {
                document.body.classList.add('tv-turn-off');
                // 关机效果之后，停止所有交互，并可以调用 show404Page
                setTimeout(() => {
                    show404Page();
                }, 1000); // 关机动画时长
                return; // 停止递归循环
            }
            playRandomStaticNoise();
            startPeriodicNoise(); // 递归调用以实现循环
        }, randomDelay);
    }

    function playBgmOnInteraction() {
        if (!mainContentDiv.classList.contains('hidden')) {
            bgm.play().then(() => {
                console.log("BGM播放成功，启动噪音循环。");
                startPeriodicNoise(); // BGM播放成功后，启动噪音循环
            }).catch(e => {
                console.error("BGM播放失败:", e);
            });
            document.removeEventListener('click', playBgmOnInteraction);
            document.removeEventListener('touchend', playBgmOnInteraction);
        }
    }

    document.addEventListener('click', playBgmOnInteraction);
    document.addEventListener('touchend', playBgmOnInteraction);

    // 弹窗相关函数
    function showPopup(content) {
        popupContainer.innerHTML = `<div class="popup-box">${content}</div>`;
        popupContainer.classList.remove('hidden');
        popupContainer.classList.add('visible');
        setTimeout(() => {
            document.querySelector('.popup-box').classList.add('show');
        }, 10);
    }

    function closePopup() {
        const popupBox = document.querySelector('.popup-box');
        popupBox.classList.remove('show');
        setTimeout(() => {
            popupContainer.classList.remove('visible');
            popupContainer.classList.add('hidden');
            popupContainer.innerHTML = '';
        }, 300);
    }

    window.closePopup = closePopup;


    submitBtn.addEventListener('click', () => {
        const targetName = targetNameInput.value.trim();
        if (targetName === '') {
            const content = `
                <p>怨みを持つ相手の名前を入力してください。</p>
                <button onclick="closePopup()">了解</button>
            `;
            showPopup(content);
            return;
        }

        // 视觉效果保留在提交按钮点击事件中
        document.body.classList.add('tv-glitch-effect');
        document.body.classList.add('tv-static');
        setTimeout(() => {
            document.body.classList.remove('tv-glitch-effect');
            document.body.classList.remove('tv-static');
        }, 1500); // 效果持续1.5秒

        const content = `
            <p>${targetName}への恨み、確かに受け止めました。</p>
            <p>望むなら，その者を地獄へ流しましょう。<br>但し、ひとつ忠告があります。</p>
            <p>一度地獄へ送れば、二度と元には戻せない。<br>あなたの魂も地獄へ落ちる。それでもいいの？</p>
            <button id="yesBtn">はい</button>
            <button id="noBtn">いいえ</button>
        `;
        showPopup(content);

        setTimeout(() => {
            const yesBtn = document.getElementById('yesBtn');
            const noBtn = document.getElementById('noBtn');

            if (yesBtn) {
                yesBtn.addEventListener('click', () => {
                    // 新增：设置契约完成标记
                    localStorage.setItem('jigoku_tsushin_contract_completed', 'true');

                    const finalContent = `
                        <p>承知いたしました。${targetName}は地獄へ流されます。</p>
                        <p>しかし、あなたの魂も死後、地獄へと堕ちます。<br>後は、あなたが決めることです。</p>
                    `;
                    document.querySelector('.popup-box').innerHTML = finalContent;

                    setTimeout(() => {
                        show404Page();
                    }, 2000);

                });
            }

            if (noBtn) {
                noBtn.addEventListener('click', () => {
                    const cancelContent = `
                        <p>契約は破棄されました。</p>
                        <p>気が変わったら、いつでも入力してください。</p>
                        <button onclick="closePopup()">了解</button>
                    `;
                    document.querySelector('.popup-box').innerHTML = cancelContent;
                });
            }
        }, 100);
    });
});
