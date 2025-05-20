document.addEventListener('DOMContentLoaded', function() {
    // Flipbook elements
    const flipbook = document.getElementById('flipbook');
    const pages = document.querySelectorAll('.page');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const totalPagesDisplay = document.getElementById('total-pages');
    const zoomSlider = document.getElementById('zoom-slider');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    // Check if all required elements exist
    if (!flipbook || !prevBtn || !nextBtn || !totalPagesDisplay || !zoomSlider || !fullscreenBtn) {
        console.error('Required flipbook elements not found in the DOM');
        return; // Exit initialization if elements are missing
    }
    
    let currentPage = 0;
    const numPages = pages.length;
    
    // Make sure we have pages
    if (numPages === 0) {
        console.error('No pages found for the flipbook');
        return;
    }
    
    totalPagesDisplay.textContent = Math.ceil(numPages / 2); // Correct total display
    
    // Create and add page numbers inside each page
    function createPageNumbers() {
        pages.forEach((page, index) => {
            // Create page number element
            const pageNumberElement = document.createElement('div');
            pageNumberElement.className = 'page-number';
            pageNumberElement.textContent = index + 1;
            
            // Style the page number
            pageNumberElement.style.position = 'absolute';
            pageNumberElement.style.bottom = '10px';
            pageNumberElement.style.width = '100%';
            pageNumberElement.style.textAlign = 'center';
            pageNumberElement.style.fontSize = '12px';
            pageNumberElement.style.color = '#333';
            pageNumberElement.style.background = 'rgba(255, 255, 255, 0.7)';
            pageNumberElement.style.padding = '3px 0';
            pageNumberElement.style.borderRadius = '3px';
            pageNumberElement.style.zIndex = '10';
            
            // Add to the page
            page.appendChild(pageNumberElement);
        });
    }
    
    // Style images to fill pages
    function stylePageImages() {
        pages.forEach(page => {
            const images = page.querySelectorAll('img');
            images.forEach(img => {
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.position = 'absolute';
                img.style.top = '0';
                img.style.left = '0';
                img.style.margin = '0';
                img.style.padding = '0';
                // Set z-index lower than page number
                img.style.zIndex = '1';
            });
        });
    }
    
    // Initialize page positions
    function initializePages() {
        pages.forEach((page, index) => {
            // Set z-index in reverse order so first pages are on top
            page.style.zIndex = numPages - index;
            
            // Make sure each page is positioned relatively for absolute children
            page.style.position = 'absolute';
            page.style.width = '50%';
            page.style.height = '100%';
            page.style.overflow = 'hidden';
            
            // Position pages
            if (index % 2 === 0) {
                // Even pages (left side)
                page.style.transform = 'rotateY(0deg)';
                page.style.left = '0';
            } else {
                // Odd pages (right side)
                page.style.transform = 'rotateY(0deg)';
                page.style.left = '50%';
            }
            
            // Add click events to the page corners for turning
            page.addEventListener('click', function(e) {
                const rect = page.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Check if click is in the bottom right corner (approximately)
                if (x > rect.width * 0.8 && y > rect.height * 0.8) {
                    if (currentPage < numPages - 2) {
                        nextPage();
                    }
                }
                // Check if click is in the bottom left corner (approximately)
                else if (x < rect.width * 0.2 && y > rect.height * 0.8) {
                    if (currentPage > 0) {
                        prevPage();
                    }
                }
            });
        });
        
        // Show only the current page pair
        updatePageVisibility();
    }
    
    // Update which pages are visible based on current page
    function updatePageVisibility() {
        // Always show pages in pairs (even if we have an odd number of pages)
        pages.forEach((page, index) => {
            if (index === currentPage || index === currentPage + 1) {
                page.style.display = 'block';
                page.style.zIndex = numPages - index;
            } else {
                page.style.display = 'none';
            }
        });
        
        // Update button states
        prevBtn.disabled = currentPage <= 0;
        nextBtn.disabled = currentPage >= numPages - 2;
    }
    
    // Go to previous page with animation
    function prevPage() {
        if (currentPage > 0) {
            // Always go back by 2 pages (one spread) for consistency
            const pageToTurn = pages[currentPage];
            
            // Add turning animation before changing page
            pageToTurn.classList.add('turning-prev');
            
            // Hide page number during animation
            const pageNumber = pageToTurn.querySelector('.page-number');
            if (pageNumber) pageNumber.style.opacity = '0';
            
            // Wait for animation to complete before updating visibility
            setTimeout(() => {
                currentPage -= 2;
                updatePageVisibility();
                pageToTurn.classList.remove('turning-prev');
                
                // Show page number again
                if (pageNumber) pageNumber.style.opacity = '1';
            }, 500); // Match this to your CSS animation duration
        }
    }
    
    // Go to next page with animation
    function nextPage() {
        if (currentPage < numPages - 2) {
            // Always go forward by 2 pages (one spread) for consistency
            const pageToTurn = pages[currentPage + 1];
            
            // Add turning animation before changing page
            pageToTurn.classList.add('turning-next');
            
            // Hide page number during animation
            const pageNumber = pageToTurn.querySelector('.page-number');
            if (pageNumber) pageNumber.style.opacity = '0';
            
            // Wait for animation to complete before updating visibility
            setTimeout(() => {
                currentPage += 2;
                updatePageVisibility();
                pageToTurn.classList.remove('turning-next');
                
                // Show page number again
                if (pageNumber) pageNumber.style.opacity = '1';
            }, 500); // Match this to your CSS animation duration
        }
    }
    
    // Navigation buttons event listeners
    prevBtn.addEventListener('click', prevPage);
    nextBtn.addEventListener('click', nextPage);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevPage();
        } else if (e.key === 'ArrowRight') {
            nextPage();
        }
    });
    
    // Zoom functionality
    zoomSlider.addEventListener('input', function() {
        const zoomLevel = parseFloat(this.value);
        flipbook.style.transform = `scale(${zoomLevel})`;
        // Center the zoomed flipbook
        flipbook.style.transformOrigin = 'center center';
    });
    
    // Add CSS for page numbers and full-sized images
    function addCustomStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .page {
                position: absolute;
                width: 50%;
                height: 100%;
                overflow: hidden;
                background-size: cover;
                background-position: center;
            }
            
            .page img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .page-number {
                position: absolute;
                bottom: 10px;
                width: 100%;
                text-align: center;
                font-size: 12px;
                color: #333;
                background: rgba(255, 255, 255, 0.7);
                padding: 3px 0;
                border-radius: 3px;
                transition: opacity 0.3s ease;
                z-index: 10;
            }
            
            .turning-next, .turning-prev {
                transition: transform 0.5s ease;
            }
            
            .turning-next {
                transform: rotateY(-180deg);
            }
            
            .turning-prev {
                transform: rotateY(180deg);
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Fullscreen functionality
    let isFullscreen = false;
    
    function toggleFullscreen() {
        const container = document.querySelector('.flipbook-container');
        
        if (!container) {
            console.error('Flipbook container not found');
            return;
        }
        
        if (!isFullscreen) {
            // Enter fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.mozRequestFullScreen) { // Firefox
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) { // Chrome, Safari, Opera
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) { // IE/Edge
                container.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Use a single function for all fullscreen change events
    function updateFullscreenState() {
        isFullscreen = !!document.fullscreenElement || 
                      !!document.webkitFullscreenElement ||
                      !!document.mozFullScreenElement ||
                      !!document.msFullscreenElement;
                      
        fullscreenBtn.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
    }
    
    // Apply the same handler to all browser variants
    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
    document.addEventListener('mozfullscreenchange', updateFullscreenState);
    document.addEventListener('MSFullscreenChange', updateFullscreenState);
    
    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    
    flipbook.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = true;
    });
    
    flipbook.addEventListener('touchmove', function(e) {
        if (isSwiping) {
            e.preventDefault(); // Prevent page scrolling while swiping
        }
    }, { passive: false });
    
    flipbook.addEventListener('touchend', function(e) {
        if (isSwiping) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            isSwiping = false;
        }
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left
            nextPage();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right
            prevPage();
        }
    }
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        // Debounce resize event
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            const container = document.querySelector('.flipbook-container');
            if (!container) return;
            
            // Reset zoom on window resize to prevent layout issues
            zoomSlider.value = 1;
            flipbook.style.transform = 'scale(1)';
        }, 250);
    });
    
    // Initialize the flipbook
    try {
        addCustomStyles();    // Add required CSS
        createPageNumbers();  // Add page numbers to pages
        stylePageImages();    // Make images fill the entire page
        initializePages();    // Initialize page positions and visibility
    } catch (err) {
        console.error('Error initializing flipbook:', err);
        // Display user-friendly error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'flipbook-error';
        errorMsg.textContent = 'Could not initialize the flipbook. Please refresh the page.';
        flipbook.parentNode.insertBefore(errorMsg, flipbook);
    }
    
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Flipbook error:', e.message);
        // Log errors but don't disrupt the user experience if possible
    });
});
