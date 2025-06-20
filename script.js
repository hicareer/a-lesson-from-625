document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    let currentPageId = 'landing-page'; // 현재 활성화된 페이지 ID

    // 페이지 전환 함수
    function showPage(pageId) {
        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
                page.classList.remove('hidden');
            } else {
                page.classList.remove('active');
                page.classList.add('hidden');
            }
        });
        currentPageId = pageId; // 현재 페이지 ID 업데이트
    }

    // 초기 페이지 설정
    showPage('landing-page');

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
    document.querySelectorAll('.next-activity-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetPageId = button.dataset.targetPage;
            if (targetPageId) {
                showPage(targetPageId);
            }
        });
    });

    // --- 1번 활동: 이미지 슬라이더 ---
    const sliderContainers = document.querySelectorAll('.slider-container');

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

    const flagsContainer = document.querySelector('#activity2-quiz-page .flags-container');
    const namesContainer = document.querySelector('#activity2-quiz-page .names-container');
    const quizNextButton = document.getElementById('quiz-next-button');
    let correctMatches = 0;
    const totalCountries = countries.length;

    function initializeQuiz() {
        // 국기 섞어서 배치
        const shuffledCountries = [...countries].sort(() => Math.random() - 0.5);
        flagsContainer.innerHTML = '';
        shuffledCountries.forEach(country => {
            const img = document.createElement('img');
            img.src = `${country}.gif`; /* 이미지 경로 수정 */
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

        document.querySelectorAll('.flag-item').forEach(item => {
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

        document.querySelectorAll('.name-box').forEach(box => {
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
                        // 여기서는 간단히 드롭을 허용하지 않는 것으로 처리
                        // (CSS로 드래그 오버 시 색상 변경만 하고, 드롭 시 아무 일도 일어나지 않게 함)
                        // 또는 사용자에게 오답임을 시각적으로 알려줄 수 있음
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
                if (document.getElementById('activity2-quiz-page').classList.contains('active')) {
                    initializeQuiz();
                }
            }
        }
    });
    observerQuizPage.observe(document.getElementById('activity2-quiz-page'), { attributes: true });


    // --- 3번 활동: 지도 칠하기 (캔버스 드로잉) ---
    const canvas = document.getElementById('drawing-canvas');
    const drawingContainer = document.querySelector('.drawing-container');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let isDrawing = false;

    // 캔버스 크기 조정 함수
    function resizeCanvas() {
        if (canvas && drawingContainer) {
            const containerRect = drawingContainer.getBoundingClientRect();
            canvas.width = containerRect.width;
            canvas.height = containerRect.height;
            ctx.lineWidth = 5; // 선 굵기
            ctx.lineCap = 'round'; // 선 끝 모양
            ctx.strokeStyle = '#FFD700'; // 선 색상 (황금색)
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
    }

    // --- 4번 활동: 필기창 (텍스트 에어리어) ---
    // 텍스트 에어리어는 HTML에 이미 포함되어 있으며, 새로고침 시 내용이 사라지는 것은 기본 동작입니다.
    // 별도의 JS 로직은 필요 없습니다.

    // --- 4번 활동: 폭죽 효과 ---
    const finishButton = document.getElementById('finish-button');
    if (finishButton) {
        finishButton.addEventListener('click', (e) => {
            createFireworks(e.clientX, e.clientY);
        });
    }

    function createFireworks(x, y) {
        const colors = ['#FF0', '#F00', '#0F0', '#00F', '#F0F', '#0FF']; // 폭죽 색상
        const numParticles = 30; // 폭죽 파티클 수

        for (let i = 0; i < numParticles; i++) {
            const firework = document.createElement('div');
            firework.classList.add('firework');
            document.body.appendChild(firework);

            const angle = Math.random() * Math.PI * 2; // 0에서 360도
            const distance = Math.random() * 100 + 50; // 50px에서 150px 사이

            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            firework.style.left = `${x}px`;
            firework.style.top = `${y}px`;
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            // 애니메이션 정의
            firework.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                { transform: `translate(${targetX - x - 5}px, ${targetY - y - 5}px) scale(1)`, opacity: 0 } // -5는 파티클 크기 보정
            ], {
                duration: Math.random() * 800 + 700, // 0.7초에서 1.5초
                easing: 'ease-out',
                fill: 'forwards'
            }).onfinish = () => {
                firework.remove(); // 애니메이션 끝나면 요소 제거
            };
        }
    }
});
