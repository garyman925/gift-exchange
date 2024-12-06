document.addEventListener('DOMContentLoaded', () => {
    const addPersonBtn = document.getElementById('addPersonBtn');
    const removePersonBtn = document.getElementById('removePersonBtn');
    const personCount = document.getElementById('personCount');
    const inputContainer = document.getElementById('inputContainer');
    const giftCircle = document.getElementById('giftCircle');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    let currentCount = 5;
    let intervalId = null;

    // 音效設定
    const sounds = {
        bgm: new Howl({
            src: ['path/to/background-music.mp3'],
            loop: true,
            volume: 0.5
        }),
        swap: new Howl({
            src: ['path/to/swap-sound.mp3'],
            volume: 0.3
        }),
        start: new Howl({
            src: ['path/to/start-sound.mp3'],
            volume: 0.5
        }),
        stop: new Howl({
            src: ['path/to/stop-sound.mp3'],
            volume: 0.5
        })
    };

    // 修改 createGiftContainer 函數，使用 Bootstrap 類別
    function createGiftContainer(index) {
        return `
            <div class="gift-container">
                <div class="gift-wrapper">
                    <div class="gift-owner"></div>
                    <div class="gift">🎁</div>
                </div>
                <div class="name"></div>
            </div>
        `;
    }

    // 初始化禮物的位置
    function initializeGiftPositions() {
        // 不需要設置位置，讓 flex 布局自動處理
        // 如果有需要清除之前的 transform，可以這樣做：
        const giftContainers = document.querySelectorAll('.gift-container');
        const giftWrappers = document.querySelectorAll('.gift-wrapper');
        
        giftContainers.forEach(container => {
            container.style.transform = '';
        });
        
        giftWrappers.forEach(wrapper => {
            wrapper.style.transform = '';
        });
    }

    // 修改 swapGifts 函數
    function swapGifts() {
        const giftWrappers = Array.from(document.querySelectorAll('.gift-wrapper'));
        const names = Array.from(document.querySelectorAll('.name'));
        const wrapperContents = giftWrappers.map(wrapper => wrapper.innerHTML);
        
        // 打亂內容數組
        const shuffledIndices = wrapperContents.map((_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }

        // 計算並應用移動動畫
        giftWrappers.forEach((wrapper, i) => {
            const targetIndex = shuffledIndices[i];
            const targetName = names[targetIndex];
            const targetRect = targetName.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            
            // 計算相對位移
            const deltaX = targetRect.left - wrapperRect.left;
            const deltaY = targetRect.top - wrapperRect.top;
            
            // 應用移動動畫
            wrapper.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });

        // 等待動畫完成後更新內容
        setTimeout(() => {
            // 重置 transform
            giftWrappers.forEach(wrapper => {
                wrapper.style.transform = '';
            });

            // 更新內容
            giftWrappers.forEach((wrapper, i) => {
                wrapper.innerHTML = wrapperContents[shuffledIndices[i]];
            });
            sounds.swap.play();
        }, 500);
    }

    // 更新參與者數量
    function updateParticipants(newCount) {
        // 限制最少3人，最多10人
        if (newCount < 3 || newCount > 10) return;
        
        // 更新輸入框
        inputContainer.innerHTML = ''; // 清空現有的輸入框
        for (let i = 0; i < newCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'name-input';
            input.placeholder = `請輸入姓名 ${i + 1}`;
            inputContainer.appendChild(input);
        }

        // 更新禮物圈
        giftCircle.innerHTML = Array(newCount).fill(0)
            .map((_, i) => createGiftContainer(i))
            .join('');

        // 更新計數器顯示
        currentCount = newCount;
        personCount.textContent = currentCount;

        // 重新初始化位置
        initializeGiftPositions();
        
        // 重新綁定所有輸入框的事件監聽器
        bindInputListeners();
        
        // 更新所有名字顯示
        updateAllNames();
    }

    // 新增綁定輸入監聽器的函數
    function bindInputListeners() {
        const inputs = document.querySelectorAll('.name-input');
        inputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                const nameDiv = document.querySelectorAll('.name')[index];
                const giftOwnerDiv = document.querySelectorAll('.gift-owner')[index];
                const value = input.value.trim() || `參與者 ${index + 1}`;
                
                nameDiv.textContent = value;
                giftOwnerDiv.textContent = value + "的禮物";
            });
        });
    }

    // 更新所有名字顯示
    function updateAllNames() {
        const inputs = document.querySelectorAll('.name-input');
        inputs.forEach((input, index) => {
            const nameDiv = document.querySelectorAll('.name')[index];
            const giftOwnerDiv = document.querySelectorAll('.gift-owner')[index];
            const value = input.value.trim() || `參與者 ${index + 1}`;
            
            nameDiv.textContent = value;
            giftOwnerDiv.textContent = value + "的禮物";
        });
    }

    // 添加按鈕事件
    addPersonBtn.addEventListener('click', () => {
        updateParticipants(currentCount + 1);
    });

    removePersonBtn.addEventListener('click', () => {
        updateParticipants(currentCount - 1);
    });

    // 修改開始按鈕事件
    startBtn.addEventListener('click', () => {
        updateAllNames();
        sounds.start.play();
        sounds.bgm.play();
        intervalId = setInterval(swapGifts, 1000); // 增加間隔以配合動畫
        startBtn.disabled = true;
        stopBtn.disabled = false;
    });

    // 修改 showCongratulations 函數
    async function showCongratulations() {
        // 顯示祝賀文字
        const congratsText = document.createElement('div');
        congratsText.className = 'congrats-text';
        congratsText.textContent = 'Congratulations!';
        document.body.appendChild(congratsText);

        // 發射 confetti
        const duration = 3 * 1000;
        const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 0,
            particleCount: 150,
            origin: { x: 0.5, y: 0 }
        };

        // 創建多個發射點
        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = duration;

            if (timeLeft === 0) {
                return clearInterval(interval);
            }

            const particleCount = 50;
            // 從左到右發射
            for(let i = 0; i < 3; i++) {
                tsParticles.confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.9), y: 0 }
                });
            }
        }, 250);

        // 3秒後移除祝賀文字
        setTimeout(() => {
            congratsText.remove();
            clearInterval(interval);
        }, duration);
    }

    // 修改停止按鈕事件
    stopBtn.addEventListener('click', () => {
        clearInterval(intervalId);
        sounds.bgm.stop();
        sounds.stop.play();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        showCongratulations(); // 添加慶祝效果
    });

    // 初始化
    updateParticipants(5);
}); 