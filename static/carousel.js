(function() {
    'use strict';

    if (window.carouselInitialized) return;
    window.carouselInitialized = true;

    function initCarousels() {
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(setupCarousel);
    }

    function setupCarousel(carousel) {
        const track = carousel.querySelector('.carousel-track');
        if (!track) return;
        
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.carousel-button--next');
        const prevButton = carousel.querySelector('.carousel-button--prev');
        const indicatorsNav = carousel.querySelector('.carousel-indicators');
        
        if (slides.length === 0) return;

        let currentIndex = 0;

        const updateSlidePosition = () => {
            if (!slides[currentIndex]) return;
            
            // Calculate distance to current slide
            // We sum up widths of previous slides + gaps
            let distance = 0;
            const gap = 20; // Matches CSS gap
            
            for (let i = 0; i < currentIndex; i++) {
                distance += slides[i].offsetWidth + gap;
            }
            
            const slideWidth = slides[currentIndex].offsetWidth;
            const containerWidth = carousel.offsetWidth;
            
            // Calculate center position
            // We want the center of the slide to be at the center of the container
            // transformX = (containerCenter - slideCenter)
            // But since we are moving the track, we want to shift left by 'distance' 
            // and then shift right to center it.
            // transformX = (containerWidth / 2) - (distance + slideWidth / 2)
            
            const moveAmount = (containerWidth / 2) - (distance + slideWidth / 2);
            
            track.style.transform = `translateX(${moveAmount}px)`;
            
            // Update states
            slides.forEach((s, i) => {
                if (i === currentIndex) {
                    s.classList.add('current-slide');
                    s.setAttribute('aria-hidden', 'false');
                    s.setAttribute('aria-current', 'true');
                } else {
                    s.classList.remove('current-slide');
                    s.setAttribute('aria-hidden', 'true');
                    s.setAttribute('aria-current', 'false');
                }
            });

            // Update indicators
            if (indicatorsNav) {
                const dots = Array.from(indicatorsNav.children);
                dots.forEach((d, i) => {
                    if (i === currentIndex) {
                        d.classList.add('current-slide');
                        d.setAttribute('aria-current', 'true');
                    } else {
                        d.classList.remove('current-slide');
                        d.setAttribute('aria-current', 'false');
                    }
                });
            }

            // Update arrows
            if (prevButton) {
                if (currentIndex === 0) {
                    prevButton.disabled = true;
                    prevButton.classList.add('disabled');
                } else {
                    prevButton.disabled = false;
                    prevButton.classList.remove('disabled');
                }
            }
            
            if (nextButton) {
                if (currentIndex === slides.length - 1) {
                    nextButton.disabled = true;
                    nextButton.classList.add('disabled');
                } else {
                    nextButton.disabled = false;
                    nextButton.classList.remove('disabled');
                }
            }
            
            // Pause videos in background
            slides.forEach((s, i) => {
                if (i !== currentIndex) {
                    const video = s.querySelector('video');
                    if (video) video.pause();
                }
            });
        };

        // Create indicators
        if (indicatorsNav) {
            indicatorsNav.innerHTML = '';
            slides.forEach((_, index) => {
                const indicator = document.createElement('button');
                indicator.classList.add('carousel-indicator');
                indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
                indicator.addEventListener('click', (e) => {
                    e.currentTarget.blur();
                    currentIndex = index;
                    updateSlidePosition();
                });
                indicatorsNav.appendChild(indicator);
            });
        }

        // Event Listeners
        slides.forEach((slide, index) => {
            slide.addEventListener('click', (e) => {
                if (currentIndex === index) return;
                currentIndex = index;
                updateSlidePosition();
            });
        });

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateSlidePosition();
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentIndex < slides.length - 1) {
                    currentIndex++;
                    updateSlidePosition();
                }
            });
        }
        
        // Window Resize
        window.addEventListener('resize', () => {
            requestAnimationFrame(updateSlidePosition);
        });
        
        // Touch Swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});
        
        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                // Next
                if (currentIndex < slides.length - 1) {
                    currentIndex++;
                    updateSlidePosition();
                }
            } else if (touchEndX - touchStartX > swipeThreshold) {
                // Prev
                if (currentIndex > 0) {
                    currentIndex--;
                    updateSlidePosition();
                }
            }
        }

        // Keyboard
        carousel.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') {
                if (currentIndex > 0) {
                    e.preventDefault();
                    currentIndex--;
                    updateSlidePosition();
                }
            } else if (e.key === 'ArrowRight') {
                if (currentIndex < slides.length - 1) {
                    e.preventDefault();
                    currentIndex++;
                    updateSlidePosition();
                }
            }
        });
        
        // ResizeObserver to handle image loads and container resizes
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(updateSlidePosition);
        });
        
        slides.forEach(slide => resizeObserver.observe(slide));
        
        // Initial call
        updateSlidePosition();
        
        // Also update after load to be safe
        window.addEventListener('load', updateSlidePosition);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarousels);
    } else {
        initCarousels();
    }
})();