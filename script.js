document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    let currentPageId = 'landing-page';

    function showPage(pageId) {
        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
                page.classList.remove('hidden');
                page.style.zIndex = 10;
            } else {
                page.classList.remove('active');
                page.classList.add('hidden');
                page.style.zIndex = 1;
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
        box.addEventListener('click', (event) => {
            const targetPageId = box.dataset.targetPage;
            if (targetPageId) {
                showPage(targetPageId);
            }
        });
    });

    document.querySelectorAll('.nav-button:not(#quiz-next-button):not(#finish-button)').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetPageId = button.dataset.targetPage;
            if (targetPageId) {
                showPage(targetPageId);
            }
        });
    });

    // --- 1번 활동: 이미지 슬라이더 ---
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
        const shuffledCountries = [...countries].sort(() => Math.random() - 0.5);
        flagsContainer.innerHTML = '';
        shuffledCountries.forEach(country => {
            const img = document.createElement('img');
            img.src = `${country}.gif`;
            img.alt = country;
            img.classList.add('flag-item');
            img.draggable = true;
            img.dataset.country = country;
            flagsContainer.appendChild(img);
        });

        const shuffledNames = [...countries].sort(() => Math.random() - 0.5);
        namesContainer.innerHTML = '';
        shuffledNames.forEach(country => {
            const div = document.createElement('div');
            div.classList.add('name-box');
            div.dataset.country = country;
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
                        setTimeout(() => {
                            box.classList.remove('occupied');
                        }, 500);
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
        }
