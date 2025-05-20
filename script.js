// Main JavaScript file for Uplift Grand Yearbook Website

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    initializeNavigation();
    initializeTestimonialSlider();
    initializeGalleryLightbox();
    initializeContactForm();
    initializeSmoothScrolling();
    initializeScrollToTopButton();
    initializeAnimations();
});

// Mobile Navigation Toggle
function initializeNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            
            // Change menu icon based on state
            const menuIcon = mobileMenuBtn.querySelector('i');
            if (menuIcon) {
                if (navLinks.classList.contains('active')) {
                    menuIcon.className = 'fas fa-times';
                } else {
                    menuIcon.className = 'fas fa-bars';
                }
            }
        });
    }

    // Close mobile menu when clicking a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (mobileMenuBtn.querySelector('i')) {
                    mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
                }
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (
            navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.mobile-menu')
        ) {
            navLinks.classList.remove('active');
            if (mobileMenuBtn.querySelector('i')) {
                mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
            }
        }
    });
}

// Testimonial Slider Functionality
function initializeTestimonialSlider() {
    const testimonialSlide = document.querySelector('.testimonial-slide');
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (testimonialSlide && testimonials.length > 0) {
        let currentIndex = 0;
        const testimonialWidth = 100; // 100% width

        // Function to update the slider position
        function updateSliderPosition() {
            testimonialSlide.style.transform = `translateX(-${currentIndex * testimonialWidth}%)`;
            
            // Update indicator dots if they exist
            const dots = document.querySelectorAll('.testimonial-dot');
            if (dots.length > 0) {
                dots.forEach((dot, i) => {
                    if (i === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        }

        // Create indicator dots if not present
        if (!document.querySelector('.testimonial-dots')) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'testimonial-dots';
            
            for (let i = 0; i < testimonials.length; i++) {
                const dot = document.createElement('div');
                dot.className = 'testimonial-dot';
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateSliderPosition();
                });
                dotsContainer.appendChild(dot);
            }
            
            const controlsContainer = document.querySelector('.testimonial-controls');
            if (controlsContainer) {
                controlsContainer.appendChild(dotsContainer);
            } else {
                // If no controls container exists, create one
                const newControlsContainer = document.createElement('div');
                newControlsContainer.className = 'testimonial-controls';
                newControlsContainer.appendChild(dotsContainer);
                testimonialSlide.parentElement.appendChild(newControlsContainer);
            }
        }

        // Event listeners for control buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : testimonials.length - 1;
                updateSliderPosition();
            });
        } else {
            // Create prev button if it doesn't exist
            createNavigationButton('prev');
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex < testimonials.length - 1) ? currentIndex + 1 : 0;
                updateSliderPosition();
            });
        } else {
            // Create next button if it doesn't exist
            createNavigationButton('next');
        }

        // Function to create navigation buttons if they don't exist
        function createNavigationButton(type) {
            const button = document.createElement('button');
            button.className = `control-btn ${type}-btn`;
            button.innerHTML = type === 'prev' ? '<i class="fas fa-chevron-left"></i>' : '<i class="fas fa-chevron-right"></i>';
            
            button.addEventListener('click', () => {
                if (type === 'prev') {
                    currentIndex = (currentIndex > 0) ? currentIndex - 1 : testimonials.length - 1;
                } else {
                    currentIndex = (currentIndex < testimonials.length - 1) ? currentIndex + 1 : 0;
                }
                updateSliderPosition();
            });
            
            const controlsContainer = document.querySelector('.testimonial-controls');
            if (controlsContainer) {
                // Insert before dots if they exist
                const dots = controlsContainer.querySelector('.testimonial-dots');
                if (dots && type === 'prev') {
                    controlsContainer.insertBefore(button, dots);
                } else {
                    controlsContainer.appendChild(button);
                }
            } else {
                // If no controls container exists, create one
                const newControlsContainer = document.createElement('div');
                newControlsContainer.className = 'testimonial-controls';
                newControlsContainer.appendChild(button);
                testimonialSlide.parentElement.appendChild(newControlsContainer);
            }
        }

        // Auto slide testimonials
        let autoSlide = setInterval(() => {
            currentIndex = (currentIndex < testimonials.length - 1) ? currentIndex + 1 : 0;
            updateSliderPosition();
        }, 5000);

        // Pause auto slide on hover
        testimonialSlide.addEventListener('mouseenter', () => {
            clearInterval(autoSlide);
        });

        testimonialSlide.addEventListener('mouseleave', () => {
            autoSlide = setInterval(() => {
                currentIndex = (currentIndex < testimonials.length - 1) ? currentIndex + 1 : 0;
                updateSliderPosition();
            }, 5000);
        });

        // Touch controls for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        testimonialSlide.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        testimonialSlide.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);

        function handleSwipe() {
            if (touchStartX - touchEndX > 50) {
                // Swipe left
                currentIndex = (currentIndex < testimonials.length - 1) ? currentIndex + 1 : 0;
                updateSliderPosition();
            } else if (touchEndX - touchStartX > 50) {
                // Swipe right
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : testimonials.length - 1;
                updateSliderPosition();
            }
        }
    }
}

// Gallery Lightbox Functionality
function initializeGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Check if gallery exists
    if (galleryItems.length === 0) return;
    
    // Create lightbox if it doesn't exist
    if (!document.querySelector('.lightbox')) {
        const lightboxHTML = `
            <div class="lightbox">
                <div class="lightbox-content">
                    <span class="close-lightbox">&times;</span>
                    <img src="" alt="Gallery image">
                    <div class="lightbox-nav">
                        <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                        <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }
    
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-content img');
    const closeLightbox = document.querySelector('.close-lightbox');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentImgIndex = 0;
    const galleryImages = [];

    // Collect all gallery images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            galleryImages.push(img.src);

            // Add overlay if it doesn't exist
            if (!item.querySelector('.gallery-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'gallery-overlay';
                overlay.innerHTML = '<i class="fas fa-search-plus"></i>';
                item.appendChild(overlay);
            }

            // Add click event to open lightbox
            item.addEventListener('click', () => {
                currentImgIndex = index;
                openLightbox(img.src);
            });
        }
    });

    // Function to open lightbox
    function openLightbox(imgSrc) {
        if (lightbox && lightboxImg) {
            lightboxImg.src = imgSrc;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }

    // Function to close lightbox
    function closeLightboxFunc() {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto'; // Enable scrolling
        }
    }

    // Close lightbox on click
    if (closeLightbox) {
        closeLightbox.addEventListener('click', closeLightboxFunc);
    }

    // Close lightbox when clicking outside of the image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightboxFunc();
            }
        });
    }

    // Navigate through images in lightbox
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImgIndex = (currentImgIndex > 0) ? currentImgIndex - 1 : galleryImages.length - 1;
            lightboxImg.src = galleryImages[currentImgIndex];
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImgIndex = (currentImgIndex < galleryImages.length - 1) ? currentImgIndex + 1 : 0;
            lightboxImg.src = galleryImages[currentImgIndex];
        });
    }

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightboxFunc();
        } else if (e.key === 'ArrowLeft') {
            currentImgIndex = (currentImgIndex > 0) ? currentImgIndex - 1 : galleryImages.length - 1;
            lightboxImg.src = galleryImages[currentImgIndex];
        } else if (e.key === 'ArrowRight') {
            currentImgIndex = (currentImgIndex < galleryImages.length - 1) ? currentImgIndex + 1 : 0;
            lightboxImg.src = galleryImages[currentImgIndex];
        }
    });
}

// Contact Form Validation
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        // Add form styles if missing
        const formStyles = `
            .form-group {
                margin-bottom: 20px;
                position: relative;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
            }
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #e91e63;
            }
            .form-group input.invalid,
            .form-group textarea.invalid {
                border-color: #f44336;
            }
            .error-message {
                color: #f44336;
                font-size: 0.875rem;
                margin-top: 5px;
            }
            .success-message {
                text-align: center;
                padding: 20px;
            }
            .success-message i {
                font-size: 3rem;
                color: #4CAF50;
                margin-bottom: 20px;
            }
            .success-message h3 {
                margin-bottom: 10px;
                color: #4CAF50;
            }
        `;
        
        // Add styles if not already present
        if (!document.querySelector('#form-styles')) {
            const style = document.createElement('style');
            style.id = 'form-styles';
            style.textContent = formStyles;
            document.head.appendChild(style);
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            let isValid = true;
            
            // Simple validation
            if (nameInput && nameInput.value.trim() === '') {
                markInvalid(nameInput, 'Name is required');
                isValid = false;
            } else if (nameInput) {
                markValid(nameInput);
            }
            
            if (emailInput) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailInput.value.trim() === '') {
                    markInvalid(emailInput, 'Email is required');
                    isValid = false;
                } else if (!emailRegex.test(emailInput.value.trim())) {
                    markInvalid(emailInput, 'Please enter a valid email');
                    isValid = false;
                } else {
                    markValid(emailInput);
                }
            }
            
            if (messageInput && messageInput.value.trim() === '') {
                markInvalid(messageInput, 'Message is required');
                isValid = false;
            } else if (messageInput) {
                markValid(messageInput);
            }
            
            // If form is valid, submit
            if (isValid) {
                // Normally you would send the form data to a server here
                // For demonstration, we'll just show a success message
                contactForm.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i><h3>Thank you!</h3><p>Your message has been sent successfully. We will get back to you soon.</p></div>';
            }
        });

        // Add input event listeners for real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    // Re-validate on input
                    if (input.id === 'email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (input.value.trim() === '') {
                            markInvalid(input, 'Email is required');
                        } else if (!emailRegex.test(input.value.trim())) {
                            markInvalid(input, 'Please enter a valid email');
                        } else {
                            markValid(input);
                        }
                    } else if (input.value.trim() !== '') {
                        markValid(input);
                    }
                }
            });
        });
    }

    // Helper functions for form validation
    function markInvalid(input, message) {
        input.classList.add('invalid');
        
        // Remove any existing error message
        const parent = input.parentElement;
        const existingError = parent.querySelector('.error-message');
        if (existingError) {
            parent.removeChild(existingError);
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        parent.appendChild(errorDiv);
    }

    function markValid(input) {
        input.classList.remove('invalid');
        
        // Remove any existing error message
        const parent = input.parentElement;
        const existingError = parent.querySelector('.error-message');
        if (existingError) {
            parent.removeChild(existingError);
        }
    }
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll to top button
function initializeScrollToTopButton() {
    // Create scroll to top button if it doesn't exist
    if (!document.querySelector('.scroll-top')) {
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-top';
        scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        document.body.appendChild(scrollBtn);
        
        // Add styles if missing
        if (!document.querySelector('#scroll-top-styles')) {
            const style = document.createElement('style');
            style.id = 'scroll-top-styles';
            style.textContent = `
                .scroll-top {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    background-color: #e91e63;
                    color: #fff;
                    border: none;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 99;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                }
                .scroll-top.active {
                    opacity: 1;
                    visibility: visible;
                }
                .scroll-top:hover {
                    background-color: #c2185b;
                }
            `;
            document.head.appendChild(style);
        }
    }

    const scrollTopBtn = document.querySelector('.scroll-top');
    
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('active');
            } else {
                scrollTopBtn.classList.remove('active');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Add animation on scroll
function initializeAnimations() {
    // Add animation classes to elements
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (!section.classList.contains('animate')) {
            section.classList.add('animate');
        }
    });
    
    // Add animation styles if missing
    if (!document.querySelector('#animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            .animate {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            .animate-active {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    const animateElements = document.querySelectorAll('.animate');

    function checkAnimation() {
        animateElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animate-active');
            }
        });
    }

    if (animateElements.length > 0) {
        window.addEventListener('scroll', checkAnimation);
        // Check on initial load
        checkAnimation();
    }
}

// Fix for gallery layout if needed
function fixGalleryLayout() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        const items = galleryGrid.querySelectorAll('.gallery-item');
        if (items.length > 0) {
            // Force a small timeout to ensure layout is calculated properly
            setTimeout(() => {
                galleryGrid.style.display = 'grid';
            }, 100);
        }
    }
}

// Helper function to detect if an element exists
function elementExists(selector) {
    return document.querySelector(selector) !== null;
}

// Add missing sections if needed
function checkRequiredSections() {
    const sections = [
        { id: 'about', title: 'About Us' },
        { id: 'features', title: 'Features' },
        { id: 'team', title: 'Our Team' },
        { id: 'gallery', title: 'Gallery' },
        { id: 'contact', title: 'Contact Us' }
    ];
    
    sections.forEach(section => {
        if (!elementExists(`#${section.id}`)) {
            console.warn(`Missing section: ${section.id}`);
        }
    });
}

// Run initialization when loaded
window.addEventListener('load', function() {
    fixGalleryLayout();
    checkRequiredSections();
});
