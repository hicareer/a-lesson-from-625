document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    let currentPageId = 'landing-page';

    function showPage(pageId) {
        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
                page.classList.remove('hidden');
                page.style.zIndex = '10';
            } else {
                page.classList.remove('active');
                page.classList.add('hidden');
                page.style.zIndex = '1';
            }
        });
        currentPageId = pageId;
    }

    showPage('landing-page');

    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            showPage('toc-page');
        });
    }

    document.querySelectorAll('.activity-box').forEach(box => {
        box.addEventListener('click', () => {
            const targetPageId = box.dataset.targetPage;
            if (targetPageId) showPage(targetPageId);
        });
    });

    document.querySelectorAll('.nav-button:not(#quiz-next-button):not(#finish-button)').forEach(button => {
        button.addEventListener('click', () => {
            const targetPageId = button.dataset.targetPage;
            if (targetPageId) showPage(targetPageId);
        });
    });

    // === 지도 드래그 기능 ===
    const draggableMap = document.getElementById('draggable-map');
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    if (draggableMap) {
        draggableMap.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            draggableMap.classList.add('dragging');
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            translateX += dx;
            translateY += dy;
            draggableMap.style.transform = `translate(${translateX}px, ${translateY}px)`;
            startX = e.clientX;
            startY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            draggableMap.classList.remove('dragging');
        });
    }

    // === 사진 슬라이드 (4번 활동) ===
    const verticalSliderContainer = document.querySelector('#activity4-page .vertical-slider');
    if (verticalSliderContainer) {
        const images = verticalSliderContainer.querySelectorAll('.slider-image');
        const prevButton = verticalSliderContainer.querySelector('.slider-prev');
        const nextButton = verticalSliderContainer.querySelector('.slider-next');
        let currentIndex = 0;

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });
        }

        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                showImage(currentIndex);
            });

            nextButton.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % images.length;
                showImage(currentIndex);
            });
        }

        showImage(currentIndex);
    }

    // === 폭죽 효과 전체 확산 ===
    const finishButton = document.getElementById('finish-button');
    const fireworksContainer = document.getElementById('fireworks-container');

    if (finishButton && fireworksContainer) {
        finishButton.addEventListener('click', () => {
            for (let i = 0; i < 15; i++) {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                createFireworks(x, y);
            }
        });
    }

    function createFireworks(x, y) {
        const colors = ['#FF0', '#F00', '#0F0', '#00F', '#F0F', '#0FF'];
        const numParticles = 30;

        for (let i = 0; i < numParticles; i++) {
            const firework = document.createElement('div');
            firework.classList.add('firework');
            fireworksContainer.appendChild(firework);

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 120 + 60;

            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            firework.style.left = `${x}px`;
            firework.style.top = `${y}px`;
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            firework.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(1.5)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out',
                fill: 'forwards'
            }).onfinish = () => firework.remove();
        }
    }
});
