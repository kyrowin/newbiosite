document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    const taskbarBtn = document.querySelector('.taskbar-btn');

    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    setTimeout(() => {
        card.style.transition = 'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);

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
                    if (onEdge) {
                        const rotateX = x * Math.cos(time) - z * Math.sin(time);
                        const rotateZ = x * Math.sin(time) + z * Math.cos(time);
                        const rotateY = y * Math.cos(time) - rotateZ * Math.sin(time);
                        const rotateZ2 = y * Math.sin(time) + rotateZ * Math.cos(time);
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