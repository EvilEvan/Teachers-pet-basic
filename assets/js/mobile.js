/**
 * Mobile-Specific JavaScript Module
 * Handles mobile optimizations, touch gestures, and PWA features
 */

const MobileFeatures = {
    // Touch and gesture handling
    touch: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        minSwipeDistance: 50,
        
        init() {
            this.bindTouchEvents();
            this.setupTouchFeedback();
            this.optimizeScrolling();
        },
        
        bindTouchEvents() {
            document.addEventListener('touchstart', (e) => {
                this.startX = e.changedTouches[0].screenX;
                this.startY = e.changedTouches[0].screenY;
            }, { passive: true });
            
            document.addEventListener('touchend', (e) => {
                this.endX = e.changedTouches[0].screenX;
                this.endY = e.changedTouches[0].screenY;
                this.handleSwipe();
            }, { passive: true });
        },
        
        handleSwipe() {
            const deltaX = this.endX - this.startX;
            const deltaY = this.endY - this.startY;
            
            // Horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
                if (deltaX > 0) {
                    this.onSwipeRight();
                } else {
                    this.onSwipeLeft();
                }
            }
            
            // Vertical swipe
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > this.minSwipeDistance) {
                if (deltaY > 0) {
                    this.onSwipeDown();
                } else {
                    this.onSwipeUp();
                }
            }
        },
        
        onSwipeRight() {
            // Navigate back
            const backButton = document.querySelector('[onclick*="goBack"]');
            if (backButton && !backButton.disabled) {
                backButton.click();
            }
        },
        
        onSwipeLeft() {
            // Navigate forward
            const nextButton = document.querySelector('[onclick*="goTo"], [onclick*="Continue"]');
            if (nextButton && !nextButton.disabled) {
                nextButton.click();
            }
        },
        
        onSwipeDown() {
            // Show navigation or refresh
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        
        onSwipeUp() {
            // Hide navigation or go to bottom
            const navigation = document.querySelector('.navigation');
            if (navigation) {
                navigation.scrollIntoView({ behavior: 'smooth' });
            }
        },
        
        setupTouchFeedback() {
            // Add visual feedback for touch interactions
            document.addEventListener('touchstart', (e) => {
                const target = e.target.closest('.btn, .touch-friendly, .mobile-topic-item, .mobile-comment-option');
                if (target) {
                    target.classList.add('touch-active');
                }
            }, { passive: true });
            
            document.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    document.querySelectorAll('.touch-active').forEach(el => {
                        el.classList.remove('touch-active');
                    });
                }, 150);
            }, { passive: true });
        },
        
        optimizeScrolling() {
            // Momentum scrolling for iOS
            document.body.style.webkitOverflowScrolling = 'touch';
            
            // Prevent bounce effect on body
            document.body.addEventListener('touchmove', (e) => {
                if (e.target === document.body) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    },
    
    // Device detection and optimization
    device: {
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        
        init() {
            this.addDeviceClasses();
            this.optimizeForDevice();
            this.handleOrientationChange();
        },
        
        addDeviceClasses() {
            const html = document.documentElement;
            if (this.isIOS) html.classList.add('ios');
            if (this.isAndroid) html.classList.add('android');
            if (this.isMobile) html.classList.add('mobile');
            if (this.isTablet) html.classList.add('tablet');
        },
        
        optimizeForDevice() {
            if (this.isIOS) {
                // iOS specific optimizations
                this.preventIOSZoom();
                this.fixIOSViewport();
            }
            
            if (this.isAndroid) {
                // Android specific optimizations
                this.optimizeAndroidPerformance();
            }
        },
        
        preventIOSZoom() {
            // Prevent zoom on input focus for iOS
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type !== 'range' && input.type !== 'checkbox' && input.type !== 'radio') {
                    input.style.fontSize = '16px';
                }
            });
        },
        
        fixIOSViewport() {
            // Fix iOS viewport height issues
            const setViewportHeight = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            setViewportHeight();
            window.addEventListener('resize', setViewportHeight);
            window.addEventListener('orientationchange', () => {
                setTimeout(setViewportHeight, 500);
            });
        },
        
        optimizeAndroidPerformance() {
            // Optimize animations for Android
            if (navigator.userAgent.includes('Chrome')) {
                document.body.style.backfaceVisibility = 'hidden';
                document.body.style.perspective = '1000px';
            }
        },
        
        handleOrientationChange() {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.isMobile = window.innerWidth <= 768;
                    this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
                    this.addDeviceClasses();
                    this.adjustLayoutForOrientation();
                }, 500);
            });
        },
        
        adjustLayoutForOrientation() {
            const isLandscape = window.innerWidth > window.innerHeight;
            const html = document.documentElement;
            
            if (isLandscape) {
                html.classList.add('landscape');
                html.classList.remove('portrait');
            } else {
                html.classList.add('portrait');
                html.classList.remove('landscape');
            }
        }
    },
    
    // Performance optimizations
    performance: {
        init() {
            this.lazyLoadImages();
            this.optimizeAnimations();
            this.debounceEvents();
        },
        
        lazyLoadImages() {
            const images = document.querySelectorAll('img[data-src]');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                images.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback for older browsers
                images.forEach(img => {
                    img.src = img.dataset.src;
                });
            }
        },
        
        optimizeAnimations() {
            // Reduce animations on low-end devices
            if (navigator.hardwareConcurrency <= 2) {
                document.documentElement.classList.add('reduce-motion');
            }
            
            // Pause animations when tab is not visible
            document.addEventListener('visibilitychange', () => {
                const animations = document.querySelectorAll('.mobile-spinner');
                animations.forEach(anim => {
                    if (document.hidden) {
                        anim.style.animationPlayState = 'paused';
                    } else {
                        anim.style.animationPlayState = 'running';
                    }
                });
            });
        },
        
        debounceEvents() {
            // Debounce resize events
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 250);
            });
            
            // Debounce scroll events
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    this.handleScroll();
                }, 50);
            }, { passive: true });
        },
        
        handleResize() {
            // Recalculate layout elements
            const containers = document.querySelectorAll('.container');
            containers.forEach(container => {
                container.style.minHeight = 'auto';
            });
        },
        
        handleScroll() {
            // Show/hide navigation on scroll
            const navigation = document.querySelector('.navigation');
            const scrollY = window.scrollY;
            
            if (navigation && MobileFeatures.device.isMobile) {
                if (scrollY > 100) {
                    navigation.classList.add('scrolled');
                } else {
                    navigation.classList.remove('scrolled');
                }
            }
        }
    },
    
    // Form enhancements for mobile
    forms: {
        init() {
            this.enhanceInputs();
            this.addMobileValidation();
            this.optimizeSelects();
        },
        
        enhanceInputs() {
            const inputs = document.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Add mobile-friendly classes
                input.classList.add('form-control');
                
                // Optimize input types for mobile keyboards
                if (input.type === 'email') {
                    input.setAttribute('inputmode', 'email');
                }
                if (input.type === 'tel') {
                    input.setAttribute('inputmode', 'tel');
                }
                if (input.type === 'number') {
                    input.setAttribute('inputmode', 'numeric');
                }
                
                // Add touch-friendly focus handling
                input.addEventListener('focus', () => {
                    if (MobileFeatures.device.isMobile) {
                        setTimeout(() => {
                            input.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                            });
                        }, 300);
                    }
                });
            });
        },
        
        addMobileValidation() {
            const forms = document.querySelectorAll('form');
            
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const invalid = form.querySelector(':invalid');
                    if (invalid && MobileFeatures.device.isMobile) {
                        e.preventDefault();
                        invalid.focus();
                        invalid.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        
                        // Show mobile-friendly error message
                        this.showMobileError(invalid);
                    }
                });
            });
        },
        
        showMobileError(input) {
            const existingError = input.parentNode.querySelector('.mobile-error');
            if (existingError) existingError.remove();
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'mobile-error';
            errorDiv.textContent = input.validationMessage || 'Please fill out this field correctly.';
            
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        },
        
        optimizeSelects() {
            const selects = document.querySelectorAll('select');
            
            selects.forEach(select => {
                // Add mobile-friendly styling
                select.classList.add('form-control');
                
                // Prevent zoom on iOS
                if (MobileFeatures.device.isIOS) {
                    select.style.fontSize = '16px';
                }
            });
        }
    },
    
    // PWA features
    pwa: {
        init() {
            this.registerServiceWorker();
            this.handleAppInstall();
            this.manageOfflineMode();
        },
        
        registerServiceWorker() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered:', registration);
                    })
                    .catch(error => {
                        console.log('SW registration failed:', error);
                    });
            }
        },
        
        handleAppInstall() {
            let deferredPrompt;
            
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                this.showInstallButton();
            });
            
            window.addEventListener('appinstalled', () => {
                console.log('PWA was installed');
                this.hideInstallButton();
            });
        },
        
        showInstallButton() {
            const installButton = document.createElement('button');
            installButton.className = 'btn btn-primary install-btn';
            installButton.innerHTML = '📱 Install App';
            installButton.style.position = 'fixed';
            installButton.style.bottom = '20px';
            installButton.style.right = '20px';
            installButton.style.zIndex = '1000';
            
            installButton.addEventListener('click', () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        }
                        deferredPrompt = null;
                    });
                }
            });
            
            document.body.appendChild(installButton);
        },
        
        hideInstallButton() {
            const installButton = document.querySelector('.install-btn');
            if (installButton) {
                installButton.remove();
            }
        },
        
        manageOfflineMode() {
            window.addEventListener('online', () => {
                this.showConnectionStatus('back online', 'success');
            });
            
            window.addEventListener('offline', () => {
                this.showConnectionStatus('offline', 'error');
            });
        },
        
        showConnectionStatus(message, type) {
            const statusDiv = document.createElement('div');
            statusDiv.className = `mobile-${type}`;
            statusDiv.textContent = `You are ${message}`;
            statusDiv.style.position = 'fixed';
            statusDiv.style.top = '20px';
            statusDiv.style.left = '20px';
            statusDiv.style.right = '20px';
            statusDiv.style.zIndex = '1000';
            
            document.body.appendChild(statusDiv);
            
            setTimeout(() => {
                statusDiv.remove();
            }, 3000);
        }
    },
    
    // Initialize all mobile features
    init() {
        // Check if we're on a mobile device
        if (window.innerWidth <= 1024) {
            this.touch.init();
            this.device.init();
            this.performance.init();
            this.forms.init();
            this.pwa.init();
            
            // Add mobile-specific event listeners
            this.addMobileEventListeners();
            
            console.log('Mobile features initialized');
        }
    },
    
    addMobileEventListeners() {
        // Handle back button for Android
        window.addEventListener('popstate', (e) => {
            if (window.history.length === 1) {
                e.preventDefault();
                this.handleBackButton();
            }
        });
        
        // Handle app state changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // App went to background
                this.onAppBackground();
            } else {
                // App came to foreground
                this.onAppForeground();
            }
        });
    },
    
    handleBackButton() {
        const backButton = document.querySelector('[onclick*="goBack"]');
        if (backButton) {
            backButton.click();
        } else {
            window.history.back();
        }
    },
    
    onAppBackground() {
        // Save form data when app goes to background
        if (typeof App !== 'undefined' && App.storage) {
            App.storage.saveFormData();
        }
    },
    
    onAppForeground() {
        // Check for updates when app comes to foreground
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update();
            });
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        MobileFeatures.init();
    });
} else {
    MobileFeatures.init();
}