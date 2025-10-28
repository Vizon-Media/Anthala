// Suprimă avertismentele specifice de preîncărcare
const originalWarn = console.warn;
console.warn = function(message) {
    if (typeof message === 'string' && message.includes('was preloaded using link preload but not used')) {
        return; // Ignoră acest mesaj specific
    }
    originalWarn.apply(console, arguments);
};

// Suprimă și alte mesaje similare care ar putea apărea
const originalError = console.error;
console.error = function(message) {
    if (typeof message === 'string' && message.includes('was preloaded using link preload but not used')) {
        return; // Ignoră acest mesaj specific
    }
    originalError.apply(console, arguments);
};

// Preload images for better performance
const preloadImages = () => {
    const projectImages = document.querySelectorAll('.project-image[data-src]');
    const preloaded = new Set();

    projectImages.forEach(img => {
        const src = img.getAttribute('data-src');
        if (src && !preloaded.has(src)) {
            // Adăugăm un mic delay pentru a evita preîncărcarea prea multor resurse deodată
            setTimeout(() => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
            link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
                preloaded.add(src);
            }, 100); // 100ms între fiecare preîncărcare
        }
    });
};

// Start preloading as soon as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadImages);
} else {
    preloadImages();
}

// Detectare dispozitiv mobil
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Funcție pentru a forța scroll-ul în sus
function scrollToTop() {
    // Încearcă mai multe metode pentru a asigura funcționarea pe toate dispozitivele
    window.scrollTo(0, 0);
    document.body.scrollTop = 0; // Pentru Safari
    document.documentElement.scrollTop = 0; // Pentru Chrome, Firefox, IE și Opera
    
    // Pe iOS, uneori este nevoie de un mic delay
    if (isMobile) {
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 100);
    }
}

// Asigură-te că pagina se reîncarcă mereu de la început
window.addEventListener('beforeunload', scrollToTop);
window.addEventListener('pagehide', scrollToTop);

// Pe iOS, adăugăm un eveniment suplimentar pentru schimbarea hash-ului
if (isMobile) {
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            scrollToTop();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Adăugăm animație la încărcarea inițială a paginii
    const initialTabContent = document.querySelector('.tab-content:not([style*="display: none"])');
    if (initialTabContent) {
        initialTabContent.classList.add('fade-in-up');
    }
    // Preload images (in case DOMContentLoaded fires before all images are found)
    preloadImages();
    
    // Asigură-te că pagina începe de sus la încărcare
    scrollToTop();
    
    // Pe mobil, adăugăm un mic delay suplimentar pentru a contracara orice ajustare de către browser
    if (isMobile) {
        setTimeout(scrollToTop, 300);
    }
    // Funcționalitate de căutare
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    // Funcție pentru a înlocui textul cu marcaje pentru evidențiere
    function highlightText(element, searchTerm) {
        const text = element.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        
        // Creăm un nou element span cu textul evidențiat
        const newHTML = text.replace(regex, '<span class="highlight">$1</span>');
        
        // Dacă conținutul s-a schimbat, îl actualizăm
        if (newHTML !== text) {
            element.innerHTML = newHTML;
            return true; // Returnăm true dacă am făcut modificări
        }
        return false; // Returnăm false dacă nu am făcut modificări
    }
    
    // Funcție pentru a reseta evidențierea
    function resetHighlights() {
        document.querySelectorAll('.highlight').forEach(hl => {
            const parent = hl.parentNode;
            parent.replaceChild(document.createTextNode(hl.textContent), hl);
            parent.normalize(); // Combină nodurile de text adiacente
        });
    }
    
    // Funcție pentru căutare
    function performSearch() {
        let searchTerm = searchInput.value.trim();
        if (!searchTerm) return;
        
        // Resetăm evidențierea anterioară
        resetHighlights();
        
        // Funcție pentru normalizare diacritice mai cuprinzătoare
        function normalizeText(text) {
            return text.toLowerCase()
                .normalize('NFD')  // Descompune caracterele în bază + diacritice
                .replace(/[\u0300-\u036f]/g, '') // Elimină toate diacriticele
                .replace(/[^a-z0-9\s]/g, ''); // Păstrează doar litere, cifre și spații
        }
        
        // Normalizăm termenul de căutare
        const normalizedSearchTerm = normalizeText(searchTerm);
        
        // Elementele în care căutăm (inclusiv butoanele)
        const searchableElements = document.querySelectorAll('.project-info, .project-button, .project-content, .project-description, p, li, h1, h2, h3, h4, h5, h6, button, .btn, .button, a[role="button"]');
        const results = [];
        
        // Căutăm în conținut
        searchableElements.forEach(element => {
            // Normalizăm textul pentru comparație
            const text = normalizeText(element.textContent);
            
            // Căutare flexibilă cu normalizare
            const searchWords = normalizedSearchTerm.split(/\s+/).filter(Boolean);
            let matchCount = 0;
            
            // Verificăm fiecare cuvânt din termenul de căutare
            for (const word of searchWords) {
                if (text.includes(word)) {
                    matchCount++;
                }
            }
            
            // Dacă am găsit cel puțin un cuvânt care se potrivește
            if (matchCount > 0) {
                // Calculăm un scor de relevanță
                const relevance = (matchCount / searchWords.length) * 100;
                
                // Găsim poziția primului cuvânt găsit
                const firstWord = searchWords.find(word => text.includes(word));
                const position = firstWord ? text.indexOf(firstWord) : -1;
                
                // Adăugăm la rezultate
                results.push({
                    element: element,
                    text: text,
                    position: position,
                    relevance: relevance,
                    searchTerm: searchTerm // Salvăm termenul original pentru evidențiere
                });
                
                // Încercăm să evidențiem textul găsit
                highlightText(element, searchTerm);
            }
        }); // Închiderea forEach-ului care lipsea
        
        // Sortăm rezultatele după relevanță
        results.sort((a, b) => {
            // Mai întâi după scorul de relevanță (descrescător)
            if (b.relevance !== a.relevance) {
                return b.relevance - a.relevance;
            }
            // Apoi după poziție (unde apare termenul în text)
            return a.position - b.position;
        });
        
        // Dacă nu am găsit exact, încercăm o potrivire parțială
        if (results.length === 0) {
            const searchTermCleaned = normalizedSearchTerm.replace(/[^a-z0-9]/g, '');
            searchableElements.forEach(element => {
                const elementText = normalizeText(element.textContent);
                if (elementText.includes(searchTermCleaned)) {
                    results.push({
                        element: element,
                        text: elementText,
                        position: elementText.indexOf(searchTermCleaned),
                        relevance: 50, // Scor mai mic decât potrivirile exacte
                        searchTerm: searchTerm
                    });
                }
            });
        }
        
        console.log('Rezultate căutare:', results);
        
        if (results.length > 0) {
            // Navigăm la primul rezultat
            const firstResult = results[0].element;
            firstResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Adăugăm un efect vizual pe toate elementele găsite
            results.forEach((result, index) => {
                const element = result.element;
                const originalBg = element.style.backgroundColor;
                const originalTransition = element.style.transition;
                
                // Adăugăm o tranziție pentru o animație mai fină
                element.style.transition = 'background-color 0.5s ease';
                
                // Culori diferite pentru rezultate diferite
                const colors = [
                    'rgba(44, 62, 80, 0.2)',    // Primul rezultat - mai vizibil
                    'rgba(44, 62, 80, 0.15)',   // Al doilea rezultat
                    'rgba(44, 62, 80, 0.1)'     // Al treilea rezultat
                ];
                
                const colorIndex = Math.min(index, colors.length - 1);
                element.style.backgroundColor = colors[colorIndex];
                
                // Resetăm după 3 secunde
                setTimeout(() => {
                    element.style.backgroundColor = originalBg;
                    element.style.transition = originalTransition;
                }, 3000);
            });
        } else {
            // Sugestii pentru căutări similare
            const suggestions = [
                'Încercați cu alte cuvinte cheie',
                'Verificați dacă există greșeli de scriere',
                'Căutați termeni mai generali'
            ];
            
            const message = `Nu s-au găsit rezultate pentru: "${searchTerm}"\n\n${suggestions.join('\n')}`;
            alert(message);
        }
    }
    
    // Adăugăm event listeners
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        
        // Căutare la apăsarea tastei Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    // Variabile globale
    let currentProject = 0; // 0 = imaginile inițiale
    let currentProjectSlide = 0;
    let carouselContainer = null;
    let carousel = null;
    let slideInterval = null; // Intervalul pentru slideshow

    // Referințe la elemente
    const projectButtons = document.querySelectorAll('.project-button');
    const projectContents = document.querySelectorAll('.project-content');

    // Fullscreen functionality moved to fullscreen.js

    // Inițializare elemente
    function initElements() {
        carouselContainer = document.querySelector('.carousel-container');
        carousel = document.querySelector('.carousel');
        
        if (!carouselContainer || !carousel) {
            return false;
        }
        return true;
    }

    // Inițializare aplicație
    if (initElements()) {
        showProject(0);
        
        // Adăugăm bulinele pentru carusel
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('carousel-dot')) {
                const dotIndex = parseInt(e.target.getAttribute('data-index'));
                showSlide(dotIndex);
            }
        });
    }

    // Evenimente pentru butoanele de proiect
    projectButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const projectNumber = parseInt(this.dataset.project);
            showProject(projectNumber);
            
            // Ascunde overlay-ul când se schimbă proiectul, dar nu și când e butonul Acasă
            if (projectNumber !== 0) {
                const carouselOverlay = document.querySelector('.carousel-overlay');
                if (carouselOverlay) {
                    carouselOverlay.style.display = 'none';
                }
            } else {
                // Arată overlay-ul când se apasă pe butonul Acasă
                const carouselOverlay = document.querySelector('.carousel-overlay');
                if (carouselOverlay) {
                    carouselOverlay.style.display = 'block';
                }
            }
        });
    });

    // Funcție pentru afișarea unui proiect
    function showProject(projectNumber) {
        // Oprim orice interval activ
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }

        const project = document.querySelector(`.project[data-id="${projectNumber}"]`);
        const projectInfoContainer = document.querySelector('.project-info-container');
        const dotsContainer = document.querySelector('.carousel-dots');
        const fullscreenDotsContainer = document.querySelector('.carousel-dots-fullscreen');

        if (!project || !carouselContainer || !projectInfoContainer || !dotsContainer || !fullscreenDotsContainer) {
            return;
        }
        // Actualizăm butonul activ
        projectButtons.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.project) === projectNumber);
        });

        // Resetăm clasa de animație pentru a forța reaplicarea ei
        const projectInfo = project.querySelector('.project-info');
        if (projectInfo) {
            const paragraphs = projectInfo.querySelectorAll('p');
            paragraphs.forEach(p => {
                p.classList.remove('fade-in-up');
                void p.offsetWidth; // Forțăm reflow
                p.classList.add('fade-in-up');
            });
        }

        // Preîncărcăm imaginile înainte de a modifica DOM-ul pentru a evita flickering-ul
        const projectImages = project.querySelectorAll('.project-image');
        const totalImages = projectImages.length;

        const fragment = document.createDocumentFragment();
        let loadedImages = 0;
        const slides = [];

        projectImages.forEach((img, index) => {
            const slide = document.createElement('img');
            slide.className = 'carousel-slide';
            slide.alt = img.dataset.alt || `Proiect ${projectNumber} - Imagine ${index + 1}`;

            const imgLoader = new Image();
            imgLoader.onload = function() {
                slide.src = this.src;
                if (index === 0) {
                    slide.classList.add('active');
                }

                loadedImages++;

                // Când toate imaginile s-au încărcat
                if (loadedImages === totalImages) {
                    // Ștergem conținutul vechi și adăugăm noul conținut
                    carouselContainer.innerHTML = '';
                    carouselContainer.appendChild(fragment);

                    // Actualizăm starea curentă
                    currentProject = projectNumber;
                    currentProjectSlide = 0;

                    // Facem fade in pentru noul conținut
                    setTimeout(() => {
                        carouselContainer.style.opacity = '1';
                    }, 50);

                    // Reinițializăm caruselul
                    initCarousel();

                    // Actualizăm informațiile proiectului
                    const projectInfo = project.querySelector('.project-info');
                    if (projectInfo) {
                        projectInfoContainer.innerHTML = projectInfo.innerHTML;
                    }
                    
                    // Actualizăm bulinele
                    updateDots();
                }
            };
            imgLoader.src = img.dataset.src;
            slides.push(slide);
            fragment.appendChild(slide);
        });

        // Dacă nu există imagini, afișăm un mesaj
        if (totalImages === 0) {
            carouselContainer.innerHTML = '<div class="no-images">Nu există imagini pentru acest proiect</div>';
            dotsContainer.innerHTML = ''; // Ștergem bulinele dacă nu sunt imagini
            return;
        }
        
        // Creăm bulinele pentru fiecare imagine în ambele containere
        const createDots = (container) => {
            container.innerHTML = '';
            for (let i = 0; i < totalImages; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('data-index', i);
                dot.setAttribute('aria-label', `Slide ${i + 1}`);
                dot.addEventListener('click', () => showSlide(i));
                container.appendChild(dot);
            }
        };
        
        createDots(dotsContainer);
        createDots(fullscreenDotsContainer);
    }
    let touchStartX = 0;
    let touchEndX = 0;
    // Tab switching elements
    const sectionTabs = document.querySelectorAll('.section-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Collaborator elements
    const collaboratorBtns = document.querySelectorAll('.collaborator-btn');
    const collaboratorContents = document.querySelectorAll('.collaborator-content');

    // Partner elements
    const partnerBtns = document.querySelectorAll('.partner-btn');
    const partnerContents = document.querySelectorAll('.partner-content');

    // Generic function to handle tab switching
    function switchTab(activeTab) {
        const panelId = activeTab.getAttribute('data-section');

        // Update active tabs
        sectionTabs.forEach(t => t.classList.remove('active'));
        activeTab.classList.add('active');

        // Update active panels
        tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.getAttribute('data-tab') === panelId);
        });

        // Hide all contents and deactivate all buttons
        const allContents = [...collaboratorContents, ...partnerContents];
        const allButtons = [...collaboratorBtns, ...partnerBtns];

        allContents.forEach(c => {
            c.classList.remove('active');
            c.style.display = 'none';
        });
        allButtons.forEach(btn => btn.classList.remove('active'));

        // Show the appropriate content based on the active tab
        const targetContents = panelId === 'collaboratori' ? collaboratorContents : partnerContents;
        const targetButtons = panelId === 'collaboratori' ? collaboratorBtns : partnerBtns;

        if (targetButtons.length > 0) {
            targetButtons[0].classList.add('active');
        }
        if (targetContents.length > 0) {
            const firstContent = targetContents[0];
            firstContent.classList.add('active');
            firstContent.style.display = 'block';
            // Forțăm un reflow pentru a reseta animația
            void firstContent.offsetWidth;
            // Adăugăm clasa de animație
            firstContent.classList.add('fade-in-up');
        }
    }

    // Initialize tabs
    if (sectionTabs.length > 0) {
        // Set first tab as active if none is active
        let activeTab = document.querySelector('.section-tab.active');
        if (!activeTab) {
            sectionTabs[0].classList.add('active');
            activeTab = sectionTabs[0];
        }

        // Initialize the active tab
        switchTab(activeTab);

        // Add click event listeners to all tabs
        sectionTabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab));
        });
    }

    // Collaborator buttons functionality
    collaboratorBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const contentId = 'content-' + this.getAttribute('data-content');

            // Hide all partner contents and deactivate buttons
            partnerContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });
            partnerBtns.forEach(b => b.classList.remove('active'));

            // Update active button
            collaboratorBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Hide all collaborator contents
            collaboratorContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Show selected content
            const contentToShow = document.getElementById(contentId);
            if (contentToShow) {
                contentToShow.classList.add('active');
                contentToShow.style.display = 'block';
                // Forțăm un reflow pentru a reseta animația
                void contentToShow.offsetWidth;
                // Adăugăm clasa de animație
                contentToShow.classList.add('fade-in-up');
            }

            // Ensure the collaborator tab is active
            sectionTabs[0].classList.add('active');
            sectionTabs[1].classList.remove('active');
            tabPanels[0].classList.add('active');
            tabPanels[1].classList.remove('active');
        });
    });

    // Partner buttons functionality
    partnerBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const contentId = 'content-' + this.getAttribute('data-content');

            // Hide all collaborator contents and deactivate buttons
            collaboratorContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });
            collaboratorBtns.forEach(b => b.classList.remove('active'));

            // Update active button
            partnerBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Hide all partner contents
            partnerContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Show selected content
            const contentToShow = document.getElementById(contentId);
            if (contentToShow) {
                contentToShow.classList.add('active');
                contentToShow.style.display = 'block';
                // Forțăm un reflow pentru a reseta animația
                void contentToShow.offsetWidth;
                // Adăugăm clasa de animație
                contentToShow.classList.add('fade-in-up');
            }

            // Ensure the partner tab and panel are active
            sectionTabs.forEach((tab, index) => {
                if (tab.getAttribute('data-section') === 'parteneri') {
                    tab.classList.add('active');
                    tabPanels[index].classList.add('active');
                } else {
                    tab.classList.remove('active');
                    tabPanels[index].classList.remove('active');
                }
            });
        });
    });

    // Helper function to show content and update active states
    function showContent(activeBtn, buttons, contentId, contents) {
        // Remove active class from all buttons and hide all contents
        if (buttons) {
            buttons.forEach(b => b.classList.remove('active'));
        }
        if (contents) {
            contents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });
        }

        // Add active class to clicked button
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Show corresponding content
        const content = document.getElementById(contentId);
        if (content) {
            content.classList.add('active');
            content.style.display = 'block';
        }
    } // Initialize first tab content if none is active
    if (!document.querySelector('.collaborator-content.active') && !document.querySelector('.partner-content.active')) {
        const activeTab = document.querySelector('.section-tab.active');
        if (activeTab) {
            const panelId = activeTab.getAttribute('data-section');
            if (panelId === 'collaboratori' && collaboratorContents.length > 0) {
                showContent(collaboratorBtns[0], collaboratorBtns, 'content-1', collaboratorContents);
                // Hide all partner contents
                partnerContents.forEach(c => c.style.display = 'none');
            } else if (panelId === 'parteneri' && partnerContents.length > 0) {
                showContent(partnerBtns[0], partnerBtns, 'p1', partnerContents);
                // Hide all collaborator contents
                collaboratorContents.forEach(c => c.style.display = 'none');
            }
        } else if (sectionTabs.length > 0) {
            // If no active tab but we have tabs, activate the first one
            sectionTabs[0].classList.add('active');
            const panelId = sectionTabs[0].getAttribute('data-section');
            document.querySelector(`.tab-panel[data-tab="${panelId}"]`).classList.add('active');

            if (panelId === 'collaboratori' && collaboratorContents.length > 0) {
                showContent(collaboratorBtns[0], collaboratorBtns, 'content-1', collaboratorContents);
                // Hide all partner contents
                partnerContents.forEach(c => c.style.display = 'none');
            } else if (panelId === 'parteneri' && partnerContents.length > 0) {
                showContent(partnerBtns[0], partnerBtns, 'p1', partnerContents);
                // Hide all collaborator contents
                collaboratorContents.forEach(c => c.style.display = 'none');
            }
        }
    }

    // Butoane carusel
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    // Tab switching functionality for main tabs (Servicii/Despre noi)
    const mainTabButtons = document.querySelectorAll('.tabs-container .tab-button');
    const mainTabContents = document.querySelectorAll('.top-large > .tab-content');

    // Tab switching logic for main tabs
    mainTabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const tabId = button.getAttribute('data-tab');

            // Update active tab button
            mainTabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Show the corresponding tab content with fade-in animation
            mainTabContents.forEach(content => {
                if (content.id === tabId) {
                    content.style.display = 'block';
                    // Reset and apply fade-in animation
                    content.classList.remove('fade-in-up');
                    void content.offsetWidth; // Force reflow
                    content.classList.add('fade-in-up');
                } else {
                    content.style.display = 'none';
                }
            });
        });
    });

    // Inițializare carusel
    function initCarousel() {
        if (!carouselContainer) return;

        // Inițializare evenimente touch
        initTouchEvents();

        // Pornire slideshow
        startSlideShow();
    }

    // Actualizează starea bulinelor pentru ambele containere
    function updateDots() {
        const dotsContainers = [
            document.querySelector('.carousel-dots'),
            document.querySelector('.carousel-dots-fullscreen')
        ];
        
        dotsContainers.forEach(container => {
            if (container) {
                const dots = container.querySelectorAll('.carousel-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentProjectSlide);
                });
            }
        });
    }

    // Afișează un anumit slide
    function showSlide(index) {
        const slides = document.querySelectorAll('.carousel-slide');
        const totalSlides = slides.length;

        if (index >= totalSlides) {
            currentProjectSlide = 0;
        } else if (index < 0) {
            currentProjectSlide = totalSlides - 1;
        } else {
            currentProjectSlide = index;
        }

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentProjectSlide);
        });

        // Actualizăm starea bulinelor
        updateDots();

        // Reîncepem slideshow-ul după schimbarea manuală
        startSlideShow();
    }

    // Următorul slide
    function nextSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (!slides.length) return;
        showSlide((currentProjectSlide + 1) % slides.length);
    }

    // Slide anterior
    function prevSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (!slides.length) return;
        showSlide((currentProjectSlide - 1 + slides.length) % slides.length);
    }

    // Start automatic slideshow
    function startSlideShow() {
        stopSlideShow(); // Make sure to clear any existing interval
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    // Stop automatic slideshow
    function stopSlideShow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Event listeners
    prevButton.addEventListener('click', () => {
        prevSlide();
        startSlideShow(); // Restart the slideshow after manual navigation
    });

    nextButton.addEventListener('click', () => {
        nextSlide();
        startSlideShow(); // Restart the slideshow after manual navigation
    });

    // Pause on hover
    if (carousel) {
        carousel.addEventListener('mouseenter', stopSlideShow);
        carousel.addEventListener('mouseleave', startSlideShow);
    }

    // Gestionează evenimentele de touch pentru mobile
    function initTouchEvents() {
        if (!carousel) return;

        carousel.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        carousel.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].clientX;
            handleSwipe();
        }, { passive: true });
    }

    // Gestionează mișcarea de glisare
    function handleSwipe() {
        const swipeThreshold = 50; // Distanța minimă pentru a schimba slide-ul
        const swipeDistance = touchEndX - touchStartX;

        if (swipeDistance > swipeThreshold) {
            prevSlide();
        } else if (swipeDistance < -swipeThreshold) {
            nextSlide();
        }
    }

    // Navigare cu tastele săgeți
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    // Evenimente butoane carusel
    if (prevButton) {
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
            startSlideShow(); // Restart slideshow după navigare manuală
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
            startSlideShow(); // Restart slideshow după navigare manuală
        });
    }

    // Pornire/oprire slideshow la hover
    if (carousel) {
        carousel.addEventListener('mouseenter', stopSlideShow);
        carousel.addEventListener('mouseleave', startSlideShow);
    }

    // Eveniment pentru logo - revenire la pagina principală
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function (e) {
            e.preventDefault();
            showProject(0); // Încărcăm proiectul cu ID 0 (pagina principală)
        });
    }
    
    // Inițializare carusel
    if (carouselContainer) {
        carouselContainer.style.transition = 'opacity 0.3s ease-in-out';
        // Nu mai ascundem containerul la inițializare pentru a evita problemele de vizibilitate
        // carouselContainer.style.opacity = '0';
    }

    // Scroll indicator functionality
    const scrollIndicators = document.querySelectorAll('.scroll-indicator');
    const servicesSection = document.querySelector('#services');
    const aboutSection = document.querySelector('.about-section');
    // Function to check if content is scrolled to bottom
    function checkScrollPosition(element, indicator) {
        return function () {
            const scrollTop = element.scrollTop;
            const scrollHeight = element.scrollHeight;
            const clientHeight = element.clientHeight;

            // Show/hide indicator based on scroll position
            if (scrollTop + clientHeight >= scrollHeight - 5) {
                // Scrolled to bottom, hide indicator
                indicator.style.opacity = '0';
                indicator.style.pointerEvents = 'none';
            } else {
                // Not at bottom, show indicator
                indicator.style.opacity = '1';
                indicator.style.pointerEvents = 'auto';
            }
        };
    }

    // Add scroll event listeners for both sections
    if (servicesSection && scrollIndicators.length > 0) {
        servicesSection.addEventListener('scroll', checkScrollPosition(servicesSection, scrollIndicators[0]));
        // Initial check
        checkScrollPosition(servicesSection, scrollIndicators[0])();
    }

    if (aboutSection && scrollIndicators.length > 1) {
        aboutSection.addEventListener('scroll', checkScrollPosition(aboutSection, scrollIndicators[1]));
        // Initial check
        checkScrollPosition(aboutSection, scrollIndicators[1])();
    }

});
