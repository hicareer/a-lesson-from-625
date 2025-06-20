document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    let currentPageId = 'landing-page';

    // 페이지 전환 함수
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

    // 초기 페이지 설정
    showPage('landing-page');

    // 1. 첫 페이지: 수업 시작하기 버튼
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            showPage('toc-page');
        });
    }

    // 목차 페이지: 활동 박스 클릭
    document.querySelectorAll('.activity-box').forEach(box => {
        box.addEventListener('click', (event) => {
            const targetPageId = box.dataset.targetPage;
            if (targetPageId) {
                showPage(targetPageId);
            }
        });
    });

    // 다음 활동으로 넘어가는 공통 버튼 (🚀 아이콘)
    document.querySelectorAll('.nav-button:not(#quiz-next-button):not(#finish-button)').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetPageId = button.dataset.targetPage;
            if (targetPageId) {
                showPage(targetPageId);
            }
        });
    });

    // --- 1번 활동: 이미지 슬라이더 (첫 번째 슬라이더) ---
    const sliderContainers = document.querySelectorAll('#activity1-page .slider-container');

    sliderContainers.forEach(container => {
        const images = container.querySelectorAll('.slider-image');
        const prevButton = container.querySelector('.slider-prev');
        const nextButton = container.querySelector('.slider-next');
        let currentIndex = 0;

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.remove('active');
                if (i === index) {
                    img.classList.add('active');
                }
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
    });

    // --- 2번 활동: 국가 퀴즈 (드래그 앤 드롭) ---
    const countries = [
        "뉴질랜드", "덴마크", "독일", "룩셈부르크", "미국", "벨기에", "스웨덴", "에티오피아", "영국", "이탈리아",
        "인도", "캐나다", "콜롬비아", "태국", "튀르키예", "프랑스", "필리핀", "호주", "그리스", "남아공", "네덜란드", "노르웨이"
    ];

    const flagsContainer = document.querySelector('#activity2-page .flags-container');
    const namesContainer = document.querySelector('#activity2-page .names-container');
    const quizNextButton = document.getElementById('quiz-next-button');
    let correctMatches = 0;
    const totalCountries = countries.length;

    function initializeQuiz() {
        flagsContainer.innerHTML = '';
        namesContainer.innerHTML = '';
        correctMatches = 0;

        // 국기 섞어서 배치
        const shuffledFlags = [...countries].sort(() => Math.random() - 0.5);
        shuffledFlags.forEach(country => {
            const img = document.createElement('img');
            img.src = `${country}.gif`;
            img.alt = country;
            img.classList.add('flag-item');
            img.draggable = true;
            img.dataset.country = country;
            flagsContainer.appendChild(img);
        });

        // 국가명 텍스트 박스 섞어서 배치
        const shuffledNames = [...countries].sort(() => Math.random() - 0.5);
        shuffledNames.forEach(country => {
            const div = document.createElement('div');
            div.classList.add('name-box');
            div.dataset.country = country;
            div.innerHTML = `<span class="name-text">${country}</span>`;
            namesContainer.appendChild(div);
        });

        addDragAndDropListeners();
        updateQuizNextButton();
    }

    function addDragAndDropListeners() {
        let draggedItem = null;

        document.querySelectorAll('#activity2-page .flag-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = e.target;
                setTimeout(() => {
                    e.target.classList.add('dragging');
                }, 0);
            });

            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                draggedItem = null;
            });
        });

        document.querySelectorAll('#activity2-page .name-box').forEach(box => {
            box.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!box.classList.contains('correct') && !box.classList.contains('occupied')) {
                    box.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                }
            });

            box.addEventListener('dragleave', (e) => {
                if (!box.classList.contains('correct') && !box.classList.contains('occupied')) {
                    box.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }
            });

            box.addEventListener('drop', (e) => {
                e.preventDefault();
                box.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';

                if (draggedItem && !box.classList.contains('correct') && !box.classList.contains('occupied')) {
                    const flagCountry = draggedItem.dataset.country;
                    const boxCountry = box.dataset.country;

                    if (flagCountry === boxCountry) {
                        box.classList.add('correct');
                        box.classList.remove('occupied');
                        box.innerHTML = '';
                        box.appendChild(draggedItem);
                        draggedItem.draggable = false;
                        draggedItem.style.position = 'static';
                        draggedItem.style.width = '100%';
                        draggedItem.style.height = '100%';
                        draggedItem.style.objectFit = 'contain';
                        correctMatches++;
                        updateQuizNextButton();
                    } else {
                        box.classList.add('occupied');
                        box.style.backgroundColor = 'rgba(255, 0, 0, 0.4)'; // 오답 시 빨간색
                        setTimeout(() => {
                            box.classList.remove('occupied');
                            box.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        }, 500);
                        // 오답 시 국기 원위치로 (flagsContainer에 다시 추가)
                        flagsContainer.appendChild(draggedItem);
                        draggedItem.style.width = ''; // 인라인 스타일 초기화
                        draggedItem.style.height = '';
                        draggedItem.style.objectFit = '';
                    }
                }
            });
        });
    }

    function updateQuizNextButton() {
        if (correctMatches === totalCountries) {
            quizNextButton.disabled = false;
            quizNextButton.style.backgroundColor = '#8B4513';
            quizNextButton.style.cursor = 'pointer';
        } else {
            quizNextButton.disabled = true;
            quizNextButton.style.backgroundColor = '#555';
            quizNextButton.style.cursor = 'not-allowed';
        }
    }

    const observerQuizPage = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (document.getElementById('activity2-page').classList.contains('active')) {
                    initializeQuiz();
                }
            }
        }
    });
    observerQuizPage.observe(document.getElementById('activity2-page'), { attributes: true });

    // --- 3번 활동: 지도 칠하기 (캔버스 드로잉 & 이미지 이동/확대) ---
    const canvas = document.getElementById('drawing-canvas');
    const drawingContainer = document.querySelector('#activity3-page .drawing-container');
    const colorPicker = document.getElementById('color-picker');
    const eraserButton = document.getElementById('eraser-button');
    const drawModeButton = document.getElementById('draw-mode-button');
    const moveZoomModeButton = document.getElementById('move-zoom-mode-button');
    const drawingBackground = document.querySelector('#activity3-page .drawing-background');
    const ctx = canvas ? canvas.getContext('2d') : null;

    let isDrawing = false;
    let currentColor = colorPicker ? colorPicker.value : '#FF6F61';
    let isErasing = false;
    let isDrawingMode = true; // 그리기 모드가 기본
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let startX = 0;
    let startY = 0;
    let isDraggingImage = false;

    // 캔버스 크기 조정 함수
    function resizeCanvas() {
        if (canvas && drawingContainer) {
            const containerRect = drawingContainer.getBoundingClientRect();
            canvas.width = containerRect.width;
            canvas.height = containerRect.height;

            // 캔버스 초기화 후 기존 그리기 설정 복원
            if (ctx) {
                ctx.lineWidth = isErasing ? 20 : 5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round'; // 추가: lineJoin 설정
                ctx.strokeStyle = isErasing ? '#222' : currentColor;
                ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
            }
        }
    }

    // 이미지 변환 적용 함수
    function applyTransform() {
        drawingBackground.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`; // 캔버스도 동일하게 이동/확대
        canvas.style.transformOrigin = `0 0`; // 캔버스도 좌상단 기준
    }

    // 모드 전환 함수
    function setMode(mode) {
        isDrawingMode = (mode === 'draw');
        // *** 수정된 부분: 항상 모든 드래그/드로잉 상태를 초기화합니다. ***
        isDrawing = false;
        isDraggingImage = false;

        if (isDrawingMode) {
            drawingContainer.classList.add('drawing-mode'); // 캔버스 커서 변경용 (crosshair)
            drawModeButton.classList.add('active');
            moveZoomModeButton.classList.remove('active');
            if (ctx) { // 그리기 모드일 때 캔버스 상호작용 활성화
                canvas.style.pointerEvents = 'auto';
                // *** 수정된 부분: 모든 드로잉 속성을 명시적으로 재설정합니다. ***
                ctx.lineWidth = isErasing ? 20 : 5; // 지우개 상태에 따라 두께 설정
                ctx.lineCap = 'round'; // 선 끝 모양
                ctx.lineJoin = 'round'; // 선 연결 모양
                ctx.strokeStyle = isErasing ? '#222' : currentColor; // 지우개 상태에 따라 색상 설정
                ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over'; // 합성 모드
            }
            drawingContainer.style.cursor = 'crosshair'; // 명시적으로 커서 설정
        } else { // 이동/확대 모드
            drawingContainer.classList.remove('drawing-mode'); // crosshair 제거
            drawModeButton.classList.remove('active');
            moveZoomModeButton.classList.add('active');
            if (ctx) {
                canvas.style.pointerEvents = 'none';
            }
            drawingContainer.style.cursor = 'grab'; // 명시적으로 커서 설정
        }
    }

    window.addEventListener('resize', resizeCanvas);

    const observerDrawingPage = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (document.getElementById('activity3-page').classList.contains('active')) {
                    resizeCanvas();
                    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); // 페이지 진입 시 캔버스 초기화
                    // 캔버스 초기화 후 드로잉 모드 기본값으로 재설정 (펜, 코랄색)
                    isErasing = false;
                    currentColor = colorPicker.value;
                    if (ctx) {
                        ctx.lineWidth = 5;
                        ctx.lineCap = 'round'; // 초기화 시에도 설정
                        ctx.lineJoin = 'round'; // 초기화 시에도 설정
                        ctx.strokeStyle = currentColor;
                        ctx.globalCompositeOperation = 'source-over';
                    }
                    scale = 1;
                    translateX = 0;
                    translateY = 0;
                    applyTransform(); // 이미지 위치/크기 초기화
                    setMode('draw'); // 초기 모드 그리기
                }
            }
        }
    });
    observerDrawingPage.observe(document.getElementById('activity3-page'), { attributes: true });


    if (canvas && ctx && drawingContainer && colorPicker && eraserButton && drawModeButton && moveZoomModeButton) {
        // 그리기 모드 이벤트
        canvas.addEventListener('mousedown', (e) => {
            if (!isDrawingMode) return;
            isDrawing = true;
            ctx.beginPath();
            // --- 수정된 부분: 마우스 좌표를 drawingContainer 기준으로 계산 후 역변환 ---
            const containerRect = drawingContainer.getBoundingClientRect();
            const mouseXInContainer = e.clientX - containerRect.left;
            const mouseYInContainer = e.clientY - containerRect.top;
            const x = (mouseXInContainer - translateX) / scale;
            const y = (mouseYInContainer - translateY) / scale;
            // --- END 수정된 부분 ---
            ctx.moveTo(x, y);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing || !isDrawingMode) return;
            // --- 수정된 부분: 마우스 좌표를 drawingContainer 기준으로 계산 후 역변환 ---
            const containerRect = drawingContainer.getBoundingClientRect();
            const mouseXInContainer = e.clientX - containerRect.left;
            const mouseYInContainer = e.clientY - containerRect.top;
            const x = (mouseXInContainer - translateX) / scale;
            const y = (mouseYInContainer - translateY) / scale;
            // --- END 수정된 부분 ---
            ctx.lineTo(x, y);
            ctx.stroke();
        });

        canvas.addEventListener('mouseup', () => {
            if (!isDrawingMode) return;
            isDrawing = false;
            ctx.closePath();
        });

        canvas.addEventListener('mouseout', () => {
            if (!isDrawingMode) return;
            isDrawing = false;
            ctx.closePath();
        });

        // 색상 변경
        colorPicker.addEventListener('input', (e) => {
            currentColor = e.target.value;
            isErasing = false;
            setMode('draw'); // 색상 선택 시 자동으로 그리기 모드
        });

        // 지우개 기능
        eraserButton.addEventListener('click', () => {
            isErasing = true;
            setMode('draw'); // 지우개도 그리기 모드의 일종으로 간주
        });

        // 모드 전환 버튼
        drawModeButton.addEventListener('click', () => setMode('draw'));
        moveZoomModeButton.addEventListener('click', () => setMode('move_zoom'));


        // 이동/확대 모드 이벤트
        drawingContainer.addEventListener('mousedown', (e) => {
            if (isDrawingMode) return; // 그리기 모드에서는 작동 안 함
            isDraggingImage = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            drawingContainer.style.cursor = 'grabbing';
        });

        drawingContainer.addEventListener('mousemove', (e) => {
            if (!isDraggingImage || isDrawingMode) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;

            // *** 수정된 부분: translateX, translateY 값에 clamp를 적용하여 범위 제한 ***
            const maxTranslationRange = 3000; // 허용 가능한 최대 이동 범위 (픽셀)
            translateX = Math.max(-maxTranslationRange, Math.min(maxTranslationRange, translateX));
            translateY = Math.max(-maxTranslationRange, Math.min(maxTranslationRange, translateY));

            applyTransform();
        });

        drawingContainer.addEventListener('mouseup', () => {
            if (isDrawingMode) return;
            isDraggingImage = false;
            drawingContainer.style.cursor = 'grab';
        });

        drawingContainer.addEventListener('mouseout', () => {
            if (isDrawingMode) return;
            isDraggingImage = false;
            drawingContainer.style.cursor = 'grab';
        });

        drawingContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (isDrawingMode) return; // 그리기 모드에서는 확대/축소 작동 안 함

            const scaleAmount = 0.1;
            const mouseX = e.clientX - drawingContainer.getBoundingClientRect().left;
            const mouseY = e.clientY - drawingContainer.getBoundingClientRect().top;

            const oldScale = scale;

            if (e.deltaY < 0) { // 휠 위로 (확대)
                scale += scaleAmount;
            } else { // 휠 아래로 (축소)
                scale -= scaleAmount;
            }

            // 스케일 제한
            scale = Math.max(0.5, Math.min(3, scale));

            // 확대/축소 시 이미지 중심 유지
            translateX -= (mouseX / oldScale) * (scale - oldScale);
            translateY -= (mouseY / oldScale) * (scale - oldScale);

            applyTransform();
        });

        setMode('draw'); // 초기 모드 설정
    }


    // --- 4번 활동: 사진 슬라이드 및 필기창 ---
    // horizontal-slider 클래스를 가진 슬라이더 (4번 활동 전용)
    const horizontalSliderContainer = document.querySelector('#activity4-page .horizontal-slider');

    if (horizontalSliderContainer) {
        const images = horizontalSliderContainer.querySelectorAll('.slider-image');
        const prevButton = horizontalSliderContainer.querySelector('.slider-prev');
        const nextButton = horizontalSliderContainer.querySelector('.slider-next');
        let currentIndex = 0;

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.remove('active');
                if (i === index) {
                    img.classList.add('active');
                }
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

    // --- 5번 활동: 폭죽 효과 ---
    const finishButton = document.getElementById('finish-button');
    const fireworksContainer = document.getElementById('fireworks-container');

    if (finishButton && fireworksContainer) {
        finishButton.addEventListener('click', (e) => {
            createFireworksAtRandomLocations(10); // 여러 위치에서 10번 폭죽 터뜨리기
        });
    }

    function createFireworks(x, y) {
        const colors = ['#FF0', '#F00', '#0F0', '#00F', '#F0F', '#0FF'];
        const numParticles = 50;

        for (let i = 0; i < numParticles; i++) {
            const firework = document.createElement('div');
            firework.classList.add('firework');
            fireworksContainer.appendChild(firework);

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 100; // 거리 더 증가

            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            firework.style.left = `${x}px`;
            firework.style.top = `${y}px`;
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            firework.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(1.5)`, opacity: 0 }
            ], {
                duration: Math.random() * 1000 + 1000, // 1초에서 2초
                easing: 'ease-out',
                fill: 'forwards'
            }).onfinish = () => {
                firework.remove();
            };
        }
    }

    function createFireworksAtRandomLocations(count) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        for (let i = 0; i < count; i++) {
            // 화면 전체 범위에서 랜덤 위치
            const randomX = Math.random() * vw;
            const randomY = Math.random() * vh;
            createFireworks(randomX, randomY);
        }
    }
});
