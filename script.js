document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    const taskbarBtn = document.querySelector('.taskbar-btn');
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

    document.querySelector('.minimize-btn').addEventListener('click', () => {
        if (!card.classList.contains('minimized')) {
            card.classList.add('minimized');
            card.style.opacity = '0';
            card.style.transform = 'scale(0.5)';
            setTimeout(() => {
                card.classList.add('hidden');
                taskbarBtn.style.display = 'block';
            }, 300);
        }
    });

    taskbarBtn.addEventListener('click', () => {
        card.classList.remove('hidden');
        card.classList.remove('minimized');
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 10);
        taskbarBtn.style.display = 'none';
    });

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

    // Обработчик нажатия клавиши 0
    document.addEventListener('keydown', (e) => {
        if (e.key === '0') {
            fillCubeBtn.style.display = 'block';
        }
    });
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
        const scale = 10;

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