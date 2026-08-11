window.changeLanguage = function(lang) {
    localStorage.setItem('siteLang', lang);
    
    document.querySelectorAll('.lang-text').forEach(el => {
        if (el.getAttribute(`data-${lang}`)) {
            el.innerHTML = el.getAttribute(`data-${lang}`);
        }
    });

    document.querySelectorAll('.lang-input').forEach(el => {
        if (el.getAttribute(`data-${lang}`)) {
            el.placeholder = el.getAttribute(`data-${lang}`);
        }
    });

    const desktopLangText = document.getElementById('desktop-lang-text');
    if (desktopLangText) {
        desktopLangText.textContent = lang === 'th' ? 'ภาษา' : 'Language';
    }

    const btnEn = document.getElementById('btn-lang-en');
    const btnTh = document.getElementById('btn-lang-th');
    
    if (btnEn && btnTh) {
        if (lang === 'en') {
            btnEn.className = "flex items-center gap-2 bg-[#059644] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md transition-all";
            btnTh.className = "flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all";
        } else {
            btnTh.className = "flex items-center gap-2 bg-[#059644] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md transition-all";
            btnEn.className = "flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all";
        }
    }
};

async function loadComponents() {
    try {
   const headerRes = await fetch('components/header.html');
        if (headerRes.ok) document.getElementById('header-placeholder').innerHTML = await headerRes.text();

        const footerRes = await fetch('components/footer.html');
        if (footerRes.ok) document.getElementById('footer-placeholder').innerHTML = await footerRes.text();
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadComponents();

    const currentLang = localStorage.getItem('siteLang') || 'th';
    window.changeLanguage(currentLang);

    const counters = document.querySelectorAll(".counter-value");
    const animationDuration = 2000;

    const startCounting = (counter) => {
        if (counter.animationId) cancelAnimationFrame(counter.animationId);
        const target = parseFloat(counter.getAttribute("data-target"));
        const decimals = parseInt(counter.getAttribute("data-decimals") || 0);
        let startTime = null;

        const updateCount = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const currentVal = target * easeOut;

            if (progress < 1) {
                counter.innerText = currentVal.toFixed(decimals);
                counter.animationId = requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target.toFixed(decimals);
            }
        };
        counter.animationId = requestAnimationFrame(updateCount);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const counter = entry.target;
            if (entry.isIntersecting) {
                startCounting(counter);
            } else {
                if (counter.animationId) cancelAnimationFrame(counter.animationId);
                const decimals = parseInt(counter.getAttribute("data-decimals") || 0);
                counter.innerText = (0).toFixed(decimals);
            }
        });
    }, { threshold: 0.1 });

    counters.forEach(counter => counterObserver.observe(counter));

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0', '-translate-y-16', 'translate-y-16');
                entry.target.classList.add('opacity-100', 'translate-y-0');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.scroll-anim').forEach(el => scrollObserver.observe(el));

    const scrubContainers = document.querySelectorAll('.scrub-target');
    scrubContainers.forEach(container => {
        const paragraphs = container.querySelectorAll('p');
        paragraphs.forEach(p => {
            const words = p.innerText.split(' ');
            p.innerHTML = words.map(word =>
                `<span class="scrub-word opacity-30 transition-opacity duration-200">${word}</span>`
            ).join(' ');
        });
    });

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        scrubContainers.forEach(container => {
            const rect = container.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0) {
                const startPoint = windowHeight * 0.85;
                const endPoint = windowHeight * 0.3;
                const scrolled = startPoint - rect.top;
                const totalScrollable = startPoint - endPoint + (rect.height * 0.5);
                let progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
                const words = container.querySelectorAll('.scrub-word');
                const wordsToShow = Math.floor(progress * words.length);

                words.forEach((word, index) => {
                    if (index < wordsToShow) {
                        word.style.opacity = '1';
                        word.style.color = '#111111';
                    } else {
                        word.style.opacity = '0.3';
                        word.style.color = 'inherit';
                    }
                });
            }
        });
    });

    const slider = document.getElementById('product-slider');
    const dotsContainer = document.getElementById('slider-dots');
    
    if (slider && dotsContainer) {
        const cards = Array.from(slider.children).filter(child => child.tagName === 'DIV');
        let autoPlayTimer;
        const autoPlayDelay = 3000;
        let dots = [];

        function initSlider() {
            if (cards.length === 0) return;
            const itemWidth = cards[0].offsetWidth + (parseFloat(getComputedStyle(slider).gap) || 16);
            const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
            const maxSteps = Math.round(maxScrollLeft / itemWidth) + 1;

            dotsContainer.innerHTML = '';
            dots = [];

            for (let i = 0; i < maxSteps; i++) {
                const dot = document.createElement('button');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => {
                    slider.scrollTo({ left: i * itemWidth, behavior: 'smooth' });
                });
                dotsContainer.appendChild(dot);
                dots.push(dot);
            }
            updateActiveDot();
        }

        function updateActiveDot() {
            if (cards.length === 0 || dots.length === 0) return;
            const itemWidth = cards[0].offsetWidth + (parseFloat(getComputedStyle(slider).gap) || 16);
            let activeIndex = Math.round(slider.scrollLeft / itemWidth);

            if (activeIndex >= dots.length) activeIndex = dots.length - 1;
            if (activeIndex < 0) activeIndex = 0;

            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.className = 'w-6 h-6 rounded-full border-2 border-spen-green flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out shrink-0';
                    dot.innerHTML = '<div class="w-2.5 h-2.5 bg-spen-green rounded-full"></div>';
                } else {
                    dot.className = 'w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-300 ease-in-out cursor-pointer shrink-0';
                    dot.innerHTML = '';
                }
            });
        }

        slider.addEventListener('scroll', updateActiveDot);
        window.addEventListener('resize', initSlider);

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayTimer = setInterval(() => {
                const itemWidth = cards[0].offsetWidth + (parseFloat(getComputedStyle(slider).gap) || 16);
                if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 2) {
                    slider.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    slider.scrollTo({ left: slider.scrollLeft + itemWidth, behavior: 'smooth' });
                }
            }, autoPlayDelay);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayTimer);
        }

        initSlider();
        startAutoPlay();

        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('touchstart', stopAutoPlay, { passive: true });
        slider.addEventListener('mouseleave', startAutoPlay);
        slider.addEventListener('touchend', startAutoPlay);

        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            stopAutoPlay();
            slider.classList.add('cursor-grabbing');
            slider.classList.remove('cursor-grab', 'snap-mandatory');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            startAutoPlay();
            slider.classList.remove('cursor-grabbing');
            slider.classList.add('cursor-grab', 'snap-mandatory');
        });

        slider.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                startAutoPlay();
                slider.classList.remove('cursor-grabbing');
                slider.classList.add('cursor-grab', 'snap-mandatory');
            }
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.5;
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenuIcon && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');

            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                setTimeout(() => {
                    mobileMenu.classList.remove('opacity-0', '-translate-y-2');
                    mobileMenu.classList.add('opacity-100', 'translate-y-0');
                }, 10);
                mobileMenuIcon.classList.remove('ph-list');
                mobileMenuIcon.classList.add('ph-x', 'rotate-90');
            } else {
                mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                mobileMenu.classList.add('opacity-0', '-translate-y-2');
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300);
                mobileMenuIcon.classList.remove('ph-x', 'rotate-90');
                mobileMenuIcon.classList.add('ph-list');
            }
        });
    }

    const setupStaggeredAnimation = (itemClass, imgClass) => {
        const items = document.querySelectorAll(itemClass);
        const imgItem = imgClass ? document.querySelector(imgClass) : null;

        const observer = new IntersectionObserver((entries) => {
            let delayTime = 0;
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.remove('opacity-0', 'translate-y-12', '-translate-y-16');
                        entry.target.classList.add('opacity-100', 'translate-y-0');
                        
                        if (!entry.target.classList.contains('animate-fade-in-up')) {
                            entry.target.classList.add('animate-fade-in-up');
                        }
                    }, delayTime);

                    delayTime += 200;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        if (imgItem) observer.observe(imgItem);
        items.forEach(item => observer.observe(item));
    };

    setupStaggeredAnimation('.stat-item', null);
    setupStaggeredAnimation('.about-item', '.about-img');
    setupStaggeredAnimation('.product-item', '.product-img');
    setupStaggeredAnimation('.serve-item', null);
    setupStaggeredAnimation('.core-item', null);
    setupStaggeredAnimation('.core-value-item', null);
    setupStaggeredAnimation('.logo-section', null);
    setupStaggeredAnimation('.cert-item', null);
    setupStaggeredAnimation('.contact-item', null);
    setupStaggeredAnimation('.footer-item', null);

    window.addEventListener('scroll', () => {
        if (window.innerWidth < 1024) {
            const parallaxEls = document.querySelectorAll('#about-parallax, #products-parallax');
            parallaxEls.forEach(el => {
                if (el) el.style.transform = 'translateY(0px)';
            });
            return;
        }

        const parallaxElements = [
            document.getElementById('about-parallax'),
            document.getElementById('products-parallax'),
            document.getElementById('serve-title-parallax'),
            document.getElementById('map-title-parallax'),
            document.getElementById('cert-text-parallax')
        ];

        parallaxElements.forEach(el => {
            if (el) {
                const rect = el.getBoundingClientRect();
                const viewHeight = window.innerHeight;

                if (rect.top <= viewHeight && rect.bottom >= 0) {
                    const speed = 0.15;
                    const yPos = (rect.top - viewHeight / 2) * speed;
                    el.style.transform = `translateY(${yPos}px)`;
                }
            }
        });
    });

    const imgContainer = document.getElementById('core-img-container');
    const serviceCards = document.querySelectorAll('.service-card');

    if (imgContainer && serviceCards.length > 0) {
        const serviceImages = [
            "component/images/Core_Services/Capabilities & Equipment.jpg",
            "component/images/Core_Services/Quality & Precision.jpg",
            "component/images/Core_Services/Process Control & Traceability.jpg",
            "component/images/Core_Services/On-Time Delivery.jpg"
        ];

        let currentIndex = -1;
        let autoPlayTimer2;
        const autoPlayDelay2 = 4000;

        function updateServiceState(index) {
            if (currentIndex === index) return;
            currentIndex = index;

            if (imgContainer) {
                const oldImg = imgContainer.querySelector('.current-img');
                const newImg = document.createElement('img');
                
                newImg.src = serviceImages[index];
                newImg.className = 'current-img w-full h-full object-cover absolute inset-0 z-20 transition-all duration-1000 opacity-0 translate-y-16';
                newImg.style.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
                newImg.alt = "Core Service";

                imgContainer.appendChild(newImg);
                void newImg.offsetWidth;

                newImg.classList.remove('opacity-0', 'translate-y-16');
                newImg.classList.add('opacity-80', 'translate-y-0');

                if (oldImg) {
                    oldImg.classList.remove('current-img', 'translate-y-0', 'opacity-80');
                    oldImg.classList.add('opacity-0', '-translate-y-16', 'z-10');
                    setTimeout(() => {
                        if (oldImg.parentElement) oldImg.remove();
                    }, 1000);
                }
            }

            serviceCards.forEach((card, i) => {
                const icon = card.querySelector('.service-icon');
                const title = card.querySelector('.service-title');
                const desc = card.querySelector('.service-desc');
                const activeBg = card.querySelector('.card-active-bg');
                const activeOverlay = card.querySelector('.card-active-overlay');

                if (i === index) {
                    card.classList.add('scale-[1.03]', 'shadow-2xl', 'z-10', 'border-gray-300');
                    card.classList.remove('bg-white/5', 'border-white/10', 'hover:bg-white/10', 'z-0');
                    if (activeBg) activeBg.classList.remove('opacity-0');
                    if (activeOverlay) activeOverlay.classList.remove('opacity-0');
                    if (icon) icon.src = icon.getAttribute('data-active');
                    if (title) title.classList.replace('text-white', 'text-spen-green');
                    if (desc) desc.classList.replace('text-white', 'text-gray-800');
                } else {
                    card.classList.remove('scale-[1.03]', 'shadow-2xl', 'z-10', 'border-gray-300');
                    card.classList.add('bg-white/5', 'border-white/10', 'hover:bg-white/10', 'z-0');
                    if (activeBg) activeBg.classList.add('opacity-0');
                    if (activeOverlay) activeOverlay.classList.add('opacity-0');
                    if (icon) icon.src = icon.getAttribute('data-inactive');
                    if (title) title.classList.replace('text-spen-green', 'text-white');
                    if (desc) desc.classList.replace('text-gray-800', 'text-white');
                }
            });
        }

        function startAutoPlay2() {
            clearInterval(autoPlayTimer2);
            autoPlayTimer2 = setInterval(() => {
                let nextIndex = (currentIndex + 1) % serviceCards.length;
                updateServiceState(nextIndex);
            }, autoPlayDelay2);
        }

        serviceCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                updateServiceState(index);
                startAutoPlay2();
            });
            card.addEventListener('mouseenter', () => clearInterval(autoPlayTimer2));
            card.addEventListener('mouseleave', startAutoPlay2);
        });

        updateServiceState(0);
        startAutoPlay2();
    }

    const circles = document.querySelectorAll('.stat-circle');
    let hasAnimated = false;

    const animateCircle = (circle, index) => {
        return new Promise(resolve => {
            circle.classList.remove('opacity-0', 'translate-y-10');
            circle.classList.add('opacity-100', 'translate-y-0');

            const numberEl = circle.querySelector('.stat-number');
            if (numberEl) {
                const target = parseFloat(numberEl.getAttribute('data-target'));
                const hasDecimal = numberEl.hasAttribute('data-decimal');
                const duration = 1000;
                const frameRate = 30;
                const totalFrames = Math.round((duration / 1000) * frameRate);
                let currentFrame = 0;

                const counter = setInterval(() => {
                    currentFrame++;
                    const progress = currentFrame / totalFrames;
                    const current = target * (1 - Math.pow(1 - progress, 3));

                    numberEl.innerText = hasDecimal ? current.toFixed(1) : Math.round(current);

                    if (currentFrame >= totalFrames) {
                        clearInterval(counter);
                        numberEl.innerText = hasDecimal ? target.toFixed(1) : target;
                    }
                }, 1000 / frameRate);
            }

            const svgBorder = circle.querySelector('.draw-border');
            if (svgBorder) {
                setTimeout(() => {
                    svgBorder.classList.add('drawn');
                }, 200);
            }

            setTimeout(() => {
                resolve();
            }, 1000);
        });
    };

    const circleObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
            hasAnimated = true;
            const runSequence = async () => {
                for (let i = 0; i < circles.length; i++) {
                    await animateCircle(circles[i], i);
                }
            };
            runSequence();
        }
    }, { threshold: 0.3 });

    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) circleObserver.observe(statsContainer);

    const mapSection = document.getElementById('map-section');
    const mapImg = document.getElementById('world-map-img');
    const mapText = document.getElementById('map-text');
    const mapBadge = document.getElementById('map-badge');
    const mapCounter = document.getElementById('map-counter');
    let mapAnimated = false;

    const mapObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !mapAnimated) {
            mapAnimated = true;

            if (mapImg) {
                mapImg.classList.remove('opacity-0', 'translate-y-10', 'scale-95');
                mapImg.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            }
            if (mapText) {
                mapText.classList.remove('opacity-0', 'translate-y-8');
                mapText.classList.add('opacity-100', 'translate-y-0');
            }
            if (mapBadge) {
                mapBadge.style.transitionTimingFunction = "cubic-bezier(0.34, 1.56, 0.64, 1)";
                mapBadge.classList.remove('opacity-0', 'scale-50');
                mapBadge.classList.add('opacity-100', 'scale-100');
            }
            if (mapCounter) {
                const target = parseInt(mapCounter.getAttribute('data-target'));
                const duration = 2000;
                const frameRate = 30;
                const totalFrames = Math.round((duration / 1000) * frameRate);
                let currentFrame = 0;

                setTimeout(() => {
                    const counter = setInterval(() => {
                        currentFrame++;
                        const progress = currentFrame / totalFrames;
                        const current = target * (1 - Math.pow(1 - progress, 3));

                        mapCounter.innerText = Math.round(current);

                        if (currentFrame >= totalFrames) {
                            clearInterval(counter);
                            mapCounter.innerText = target;
                        }
                    }, 1000 / frameRate);
                }, 500);
            }
        }
    }, { threshold: 0.3 });

    if (mapSection) mapObserver.observe(mapSection);

    const certSlides = document.querySelectorAll('.cert-slide');
    const certDotsContainer = document.getElementById('cert-dots');

    if (certSlides.length > 0 && certDotsContainer) {
        let currentCertIndex = 0;
        let certSlideInterval;
        const certDelay = 4000;
        let certDots = [];

        function initCertSlider() {
            certDotsContainer.innerHTML = '';
            certDots = [];

            certSlides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.setAttribute('aria-label', `Go to certificate slide ${i + 1}`);

                dot.addEventListener('click', () => {
                    showCertSlide(i);
                    stopCertSlide();
                    startCertSlide();
                });

                certDotsContainer.appendChild(dot);
                certDots.push(dot);
            });

            updateCertDots();
        }

        function showCertSlide(index) {
            if (index >= certSlides.length) index = 0;
            if (index < 0) index = certSlides.length - 1;

            currentCertIndex = index;

            certSlides.forEach((slide, i) => {
                if (i === currentCertIndex) {
                    slide.style.transform = 'translateX(0)';
                    slide.style.zIndex = '10';
                } else if (i < currentCertIndex) {
                    slide.style.transform = 'translateX(-100%)';
                    slide.style.zIndex = '1';
                } else {
                    slide.style.transform = 'translateX(100%)';
                    slide.style.zIndex = '1';
                }
            });

            updateCertDots();
        }

        function updateCertDots() {
            certDots.forEach((dot, index) => {
                if (index === currentCertIndex) {
                    dot.className = 'w-6 h-6 rounded-full border-2 border-spen-green flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out shrink-0';
                    dot.innerHTML = '<div class="w-2.5 h-2.5 bg-spen-green rounded-full"></div>';
                } else {
                    dot.className = 'w-3 h-3 rounded-full bg-white/40 hover:bg-white/60 transition-all duration-300 ease-in-out cursor-pointer shrink-0';
                    dot.innerHTML = '';
                }
            });
        }

        function startCertSlide() {
            stopCertSlide();
            certSlideInterval = setInterval(() => {
                let nextIndex = (currentCertIndex + 1) % certSlides.length;
                showCertSlide(nextIndex);
            }, certDelay);
        }

        function stopCertSlide() {
            clearInterval(certSlideInterval);
        }

        initCertSlider();
        showCertSlide(0);
        startCertSlide();

        const certSliderContainer = document.getElementById('cert-slider');
        if (certSliderContainer) {
            certSliderContainer.addEventListener('mouseenter', stopCertSlide);
            certSliderContainer.addEventListener('mouseleave', startCertSlide);
        }
    }
});