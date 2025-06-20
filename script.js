document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    let currentPageId = 'landing-page';

    // 페이지 전환 함수
    function showPage(pageId) {
        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
                page.classList.remove('hidden');
                // 활성화된 페이지의 z-index를 높여 클릭 가능하게 합니다.
                page.style.zIndex = '10';
            } else {
                page.classList.remove('active');
                page.classList.add('hidden');
                page.style.zIndex = '1'; // 비활성화된 페이지는 낮은 z-index
            }
        });
        currentPageId = pageId;
    }

    // 초기 페이지 설정
    showPage('landing-page'); // 맨 처음 페이지 로드 시 'landing-page' 활성화

    // 첫 페이지: 수업 시작하기 버튼
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
    // 퀴즈 다음 버튼과 폭죽 버튼은 별도로 처리되므로 제외합니다.
    document.querySelectorAll('.nav-button:not(#quiz-next-button):not(#finish-button)').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetPageId = button.dataset.targetPage;
            if (targetPageId) {
                showPage(targetPageId);
            }
        });
    });

    // --- 1번 활동: 이미지 슬라이더 ---
    // #activity4-page의 슬라이더는 vertical-slider 클래스를 가지므로 제외하여 겹치지 않게 합니다.
    const sliderContainers = document.querySelectorAll('.slider-container:not(.vertical-slider)');

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

        // 초기 이미지 표시
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
        // 국기 섞어서 배치
        const shuffledCountries = [...countries].sort(() => Math.random() - 0.5);
        flagsContainer.innerHTML = '';
        shuffledCountries.forEach(country => {
            const img = document.createElement('img');
            img.src = `${country}.gif`;
            img.alt = country;
            img.classList.add('flag-item');
            img.draggable = true;
            img.dataset.country = country; // 데이터 속성으로 국가명 저장
            flagsContainer.appendChild(img);
        });

        // 국가명 텍스트 박스 섞어서 배치
        const shuffledNames = [...countries].sort(() => Math.random() - 0.5);
        namesContainer.innerHTML = '';
        shuffledNames.forEach(country => {
            const div = document.createElement('div');
            div.classList.add('name-box');
            div.dataset.country = country; // 데이터 속성으로 국가명 저장
            div.innerHTML = `<span class="name-text">${country}</span>`;
            namesContainer.appendChild(div);
        });

        addDragAndDropListeners();
        correctMatches = 0;
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
                e.preventDefault(); // 드롭을 허용하기 위해 기본 동작 방지
                if (!box.classList.contains('correct') && !box.classList.contains('occupied')) {
                    box.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'; // 드래그 오버 시 색상 변경
                }
            });

            box.addEventListener('dragleave', (e) => {
                if (!box.classList.contains('correct') && !box.classList.contains('occupied')) {
                    box.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; // 원래 색상으로 복원
                }
            });

            box.addEventListener('drop', (e) => {
                e.preventDefault();
                box.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; // 드롭 후 원래 색상으로 복원

                if (draggedItem && !box.classList.contains('correct') && !box.classList.contains('occupied')) {
                    const flagCountry = draggedItem.dataset.country;
                    const boxCountry = box.dataset.country;

                    if (flagCountry === boxCountry) {
                        // 정답일 경우
                        box.classList.add('correct');
                        box.classList.remove('occupied'); // 혹시 모를 경우를 대비
                        box.innerHTML = ''; // 기존 텍스트 제거
                        box.appendChild(draggedItem); // 국기 이미지를 박스 안으로 이동
                        draggedItem.draggable = false; // 정답 처리된 국기는 더 이상 드래그 불가
                        draggedItem.style.position = 'static'; // 박스 안에서 위치 고정
                        draggedItem.style.width = '100%'; // 박스에 맞게 크기 조절
                        draggedItem.style.height = '100%';
                        draggedItem.style.objectFit = 'contain';
                        correctMatches++;
                        updateQuizNextButton();
                    } else {
                        // 오답일 경우: 원래 위치로 돌아가도록 (JS로는 직접적인 '원래 위치' 복원이 어려움)
                        box.classList.add('occupied'); // 잠시 빨간색으로 표시
                        setTimeout(() => {
                            box.classList.remove('occupied');
                        }, 500); // 0.5초 후 원래대로
                    }
                }
            });
        });
    }

    function updateQuizNextButton() {
        if (correctMatches === totalCountries) {
            quizNextButton.disabled = false;
            quizNextButton.style.backgroundColor = '#8B4513'; // 활성화 색상
            quizNextButton.style.cursor = 'pointer';
        } else {
            quizNextButton.disabled = true;
            quizNextButton.style.backgroundColor = '#555'; // 비활성화 색상
            quizNextButton.style.cursor = 'not-allowed';
        }
    }

    // 퀴즈 페이지가 활성화될 때마다 초기화
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

    // --- 3번 활동: 지도 칠하기 (캔버스 드로잉) ---
    const canvas = document.getElementById('drawing-canvas');
    const drawingContainer = document.querySelector('#activity3-page .drawing-container');
    const colorPicker = document.getElementById('color-picker');
    const eraserButton = document.getElementById('eraser-button');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let isDrawing = false;
    let currentColor = colorPicker ? colorPicker.value : '#FF6F61'; // 초기 색상 붉은 기 있는 코랄색
    let isErasing = false;

    // 캔버스 크기 조정 함수
    function resizeCanvas() {
        if (canvas && drawingContainer) {
            const containerRect = drawingContainer.getBoundingClientRect();
            canvas.width = containerRect.width;
            canvas.height = containerRect.height;
            // 캔버스 크기 조정 후 기존 그리기 설정 복원
            ctx.lineWidth = isErasing ? 20 : 5; // 지우개 크기 펜보다 크게
            ctx.lineCap = 'round'; // 선 끝 모양
            ctx.strokeStyle = isErasing ? '#222' : currentColor; // 지우개는 캔버스 배경색과 동일하게
            ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over'; // 지우개 모드
        }
    }

    // 페이지 로드 시 및 컨테이너 크기 변경 시 캔버스 크기 조정
    window.addEventListener('resize', resizeCanvas);
    // 3번 활동 페이지가 활성화될 때 캔버스 크기 조정 및 초기화
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
                        ctx.strokeStyle = currentColor;
                        ctx.globalCompositeOperation = 'source-over';
                    }
                }
            }
        }
    });
    observerDrawingPage.observe(document.getElementById('activity3-page'), { attributes: true });


    if (canvas) {
        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            ctx.beginPath();
            const rect = canvas.getBoundingClientRect();
            // 마우스 위치를 캔버스 내의 상대 좌표로 변환
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        });

        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
            ctx.closePath();
        });

        canvas.addEventListener('mouseout', () => {
            isDrawing = false;
            ctx.closePath();
        });

        // 색상 변경
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                currentColor = e.target.value;
                isErasing = false; // 색상 선택 시 지우개 모드 해제
                ctx.lineWidth = 5; // 펜 두께로 변경
                ctx.strokeStyle = currentColor;
                ctx.globalCompositeOperation = 'source-over'; // 일반 그리기 모드
            });
        }

        // 지우개 기능
        if (eraserButton) {
            eraserButton.addEventListener('click', () => {
                isErasing = true;
                ctx.lineWidth = 20; // 지우개 굵기
                ctx.strokeStyle = '#222'; // 캔버스 배경색과 동일하게 (지우는 효과)
                ctx.globalCompositeOperation = 'destination-out'; // 이 모드가 지우개처럼 작동합니다.
            });
        }

        // --- 확대/축소 기능 (선택사항) ---
        // 지도의 확대/축소 기능은 캔버스 위에 그리는 것과 동시에 동작하기에 구현이 복잡합니다.
        // 현재는 배경 이미지인 'act2.jpg'만 확대/축소되게 설정했습니다.
        // 드로잉과 확대/축소를 함께 하려면 캔버스 좌표계 변환 및 재그리기 로직이 필요하여 복잡도가 높아집니다.
        const drawingBackground = document.querySelector('#activity3-page .drawing-background');
        let scale = 1;
        const scaleStep = 0.1;
        const maxScale = 3;
        const minScale = 0.5;

        // 마우스 휠 이벤트로 확대/축소
        drawingContainer.addEventListener('wheel', (e) => {
            e.preventDefault(); // 기본 스크롤 방지
            const oldScale = scale;

            if (e.deltaY < 0) { // 휠 위로 (확대)
                scale = Math.min(maxScale, scale + scaleStep);
            } else { // 휠 아래로 (축소)
                scale = Math.max(minScale, scale - scaleStep);
            }

            // 확대/축소 중심점을 마우스 위치로 설정 (간단한 구현)
            const rect = drawingContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // transform-origin을 설정하여 마우스 위치를 기준으로 확대/축소되게 합니다.
            drawingBackground.style.transformOrigin = `${mouseX}px ${mouseY}px`;
            drawingBackground.style.transform = `scale(${scale})`;
            
            // 캔버스 드로잉에 대한 확대/축소는 현재 버전에서는 적용되지 않습니다.
            // (이미지만 확대/축소되고 캔버스에 그리는 내용은 고정된 크기로 유지됩니다)
        });
    }

    // --- 4번 활동: 사진 슬라이드 및 필기창 ---
    // job 이미지 슬라이더 (4번 활동 전용)
    const verticalSliderContainer = document.querySelector('#activity4-page .vertical-slider');

    if (verticalSliderContainer) {
        const images = verticalSliderContainer.querySelectorAll('.slider-image');
        const prevButton = verticalSliderContainer.querySelector('.slider-prev');
        const nextButton = verticalSliderContainer.querySelector('.slider-next');
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
            // 수직 슬라이더이므로 prev/next 버튼 위치 조정 (CSS에서 이미 처리)
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

    // --- 4번 활동: 폭죽 효과 ---
    const finishButton = document.getElementById('finish-button');
    const fireworksContainer = document.getElementById('fireworks-container');

    if (finishButton && fireworksContainer) {
        finishButton.addEventListener('click', (e) => {
            // 버튼 중앙에서 폭죽이 터지도록
            const rect = finishButton.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            createFireworks(centerX, centerY);
        });
    }

    function createFireworks(x, y) {
        const colors = ['#FF0', '#F00', '#0F0', '#00F', '#F0F', '#0FF'];
        const numParticles = 40; // 폭죽 파티클 수 증가

        for (let i = 0; i < numParticles; i++) {
            const firework = document.createElement('div');
            firework.classList.add('firework');
            fireworksContainer.appendChild(firework); // fireworks-container에 추가하여 body에 직접 추가하는 것을 방지

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 150 + 80; // 거리 증가

            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            firework.style.left = `${x}px`;
            firework.style.top = `${y}px`;
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            firework.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 }, // 시작점 중앙 정렬
                { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(1.5)`, opacity: 0 } // 목표 지점 이동 및 스케일 아웃
            ], {
                duration: Math.random() * 1000 + 800, // 0.8초에서 1.8초
                easing: 'ease-out',
                fill: 'forwards' // 애니메이션 끝난 후 최종 상태 유지
            }).onfinish = () => {
                firework.remove(); // 애니메이션 끝난 후 요소 제거
            };
        }
    }
});
