document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    setTimeout(() => {
        card.style.transition = 'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);
});

// Добавляем canvas для ASCII куба
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

// Функция для отрисовки ASCII куба
function drawASCIICube() {
    const size = 20;
    const chars = ['#', '@', '*', '+', '=', '-', '.', ' '];
    const time = Date.now() * 0.001;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 10;

    // Устанавливаем темно-серый фон
    ctx.fillStyle = 'rgba(40, 40, 40, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = -size; x <= size; x++) {
        for (let y = -size; y <= size; y++) {
            for (let z = -size; z <= size; z++) {
                if (Math.abs(x) === size || Math.abs(y) === size || Math.abs(z) === size) {
                    const rotateX = x * Math.cos(time) - z * Math.sin(time);
                    const rotateZ = x * Math.sin(time) + z * Math.cos(time);
                    const rotateY = y * Math.cos(time) - rotateZ * Math.sin(time);
                    const rotateZ2 = y * Math.sin(time) + rotateZ * Math.cos(time);

                    const screenX = centerX + rotateX * scale;
                    const screenY = centerY + rotateY * scale;

                    if (screenX >= 0 && screenX < canvas.width && screenY >= 0 && screenY < canvas.height) {
                        const char = chars[Math.floor(Math.random() * chars.length)];
                        // Устанавливаем светло-серый цвет для символов
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

// Запускаем анимацию
drawASCIICube();

// Обновляем размер canvas при изменении размера окна
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Добавляем обработчики для кнопок закрытия и сворачивания
document.querySelector('.close-btn').addEventListener('click', () => {
    window.close();
});

document.querySelector('.minimize-btn').addEventListener('click', () => {
    const card = document.querySelector('.card');
    const taskbarBtn = document.querySelector('.taskbar-btn');
    if (card.classList.contains('minimized')) {
        card.style.display = 'block';
        card.classList.remove('minimized');
        taskbarBtn.style.display = 'none';
    } else {
        card.classList.add('minimized');
        card.style.display = 'none';
        taskbarBtn.style.display = 'block';
    }
});

document.querySelector('.taskbar-btn').addEventListener('click', () => {
    const card = document.querySelector('.card');
    const taskbarBtn = document.querySelector('.taskbar-btn');
    card.style.display = 'block';
    card.classList.remove('minimized');
    taskbarBtn.style.display = 'none';
}); 