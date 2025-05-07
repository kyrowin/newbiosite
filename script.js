document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    const fillCubeBtn = document.getElementById('fillCubeBtn');
    let isCubeFilled = false;

    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    setTimeout(() => {
        card.style.transition = 'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);

    const desc = document.querySelector('.desc');
    const fullText = '\u2008Live in Russia. Love computers <3';
    desc.textContent = '\u2008';
    let i = 0;
    function typeWriter() {
        if (i <= fullText.length) {
            desc.textContent = fullText.slice(0, i);
            i++;
            setTimeout(typeWriter, 35);
        }
    }
    setTimeout(typeWriter, 800);

    const windowHeader = document.querySelector('.window-header');
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let cardX = null;
    let cardY = null;

    function setCardPosition(x, y) {
        card.style.left = x + 'px';
        card.style.top = y + 'px';
        card.style.position = 'fixed';    }
    function restoreCardPosition() {
        if (cardX !== null && cardY !== null) {
            setCardPosition(cardX, cardY);
        }
    }

    windowHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = card.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const x = e.clientX - dragOffsetX;
            const y = e.clientY - dragOffsetY;
            setCardPosition(x, y);
        }
    });
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = '';
    });

    windowHeader.addEventListener('touchstart', (e) => {
        isDragging = true;
        const rect = card.getBoundingClientRect();
        const touch = e.touches[0];
        dragOffsetX = touch.clientX - rect.left;
        dragOffsetY = touch.clientY - rect.top;
    });
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const touch = e.touches[0];
            const x = touch.clientX - dragOffsetX;
            const y = touch.clientY - dragOffsetY;
            setCardPosition(x, y);
        }
    });
    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    document.querySelector('.minimize-btn').addEventListener('click', () => {
        if (!card.classList.contains('minimized')) {
            card.classList.add('minimized');
            card.style.opacity = '0';
            card.style.transform = 'scale(0.5)';
            setTimeout(() => {
                card.classList.add('hidden');
            }, 300);
        }
    });

    function centerCard() {
        const x = window.innerWidth / 2 - card.offsetWidth / 2;
        const y = window.innerHeight / 2 - card.offsetHeight / 2;
        setCardPosition(x, y);
    }
    if (cardX === null && cardY === null) {
        centerCard();
    }

    document.querySelector('.close-btn').addEventListener('click', () => {
        window.close();
    });

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.addEventListener('keydown', (e) => {
        if (e.key === '0') {
            fillCubeBtn.style.display = 'block';
        }
    });

    let tapCount = 0;
    let tapTimer = null;
    function handleTap() {
        tapCount++;
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 2000);
        }
        if (tapCount >= 5) {
            fillCubeBtn.style.display = 'block';
            tapCount = 0;
            clearTimeout(tapTimer);
        }
    }
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.addEventListener('touchstart', handleTap);
    }

    fillCubeBtn.addEventListener('click', () => {
        isCubeFilled = !isCubeFilled;
        fillCubeBtn.textContent = isCubeFilled ? 'Очистить куб' : 'Заполнить куб';
    });

    function drawASCIICube() {
        const size = 20;
        const chars = ['#', '@', '*', '+', '='];
        const time = Date.now() * 0.001;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let scale;
        if (window.innerWidth <= 600 || window.innerHeight <= 600) {
            const minSide = Math.min(canvas.width, canvas.height);
            scale = (minSide * 0.65) / (size * 2);
        } else {
            scale = 10;
        }

        ctx.fillStyle = 'rgba(40, 40, 40, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let x = -size; x <= size; x++) {
            for (let y = -size; y <= size; y++) {
                for (let z = -size; z <= size; z++) {
                    const onEdge =
                        (Math.abs(x) === size && Math.abs(y) === size) ||
                        (Math.abs(x) === size && Math.abs(z) === size) ||
                        (Math.abs(y) === size && Math.abs(z) === size);
                    const shouldDraw = isCubeFilled ?
                        (Math.abs(x) === size || Math.abs(y) === size || Math.abs(z) === size) :
                        onEdge;
                    if (shouldDraw) {
                        const rotateX = x * Math.cos(time) - z * Math.sin(time);
                        const rotateZ = x * Math.sin(time) + z * Math.cos(time);
                        const rotateY = y * Math.cos(time) - rotateZ * Math.sin(time);
                        const screenX = centerX + rotateX * scale;
                        const screenY = centerY + rotateY * scale;
                        if (screenX >= 0 && screenX < canvas.width && screenY >= 0 && screenY < canvas.height) {
                            const char = chars[Math.floor(Math.random() * chars.length)];
                            ctx.fillStyle = 'rgba(200, 200, 200, 1)';
                            ctx.font = '12px monospace';
                            ctx.fillText(char, screenX, screenY);
                        }
                    }
                }
            }
        }
        requestAnimationFrame(drawASCIICube);
    }
    drawASCIICube();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (cardX === null && cardY === null) {
            centerCard();
        }
    });

    const appBtn = document.querySelector('.app-btn');
    function updateClock() {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const d = now.getDate().toString().padStart(2, '0');
        const mo = (now.getMonth() + 1).toString().padStart(2, '0');
        const y = now.getFullYear();
        document.getElementById('taskbar-clock').innerHTML = `${h}:${m}<br>${d}.${mo}.${y}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    appBtn.addEventListener('click', () => {
        if (!card.classList.contains('hidden')) {
            card.classList.add('minimized');
            card.style.opacity = '0';
            card.style.transform = 'scale(0.5)';
            setTimeout(() => {
                card.classList.add('hidden');
            }, 300);
        } else {
            card.classList.remove('hidden');
            card.classList.remove('minimized');
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                if (cardX === null && cardY === null) {
                    centerCard();
                } else {
                    restoreCardPosition();
                }
            }, 10);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    function typeTitle() {
        const fullTitle = 'Kyrowin / Bio';
        let i = 0;
        function typeWriter() {
            if (i <= fullTitle.length) {
                document.title = fullTitle.slice(0, i);
                i++;
                setTimeout(typeWriter, 250);
            }
        }
        typeWriter();
    }
    setTimeout(typeTitle, 10000);
});