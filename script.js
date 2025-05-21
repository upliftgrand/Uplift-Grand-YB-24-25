// Flipbook initialization and image handling
document.addEventListener('DOMContentLoaded', function() {
    // Variables and configuration
    const totalPages = 94; // Total number of pages (page1.jpg through page94.jpg)
    const imageBasePath = './'; // Path to your images folder - update this if needed
    const imagePrefix = 'page';
    const imageExtension = '.jpg';
    
    // Initialize the flipbook
    initFlipbook();
    
    // Main flipbook initialization function
    function initFlipbook() {
        const flipbook = document.getElementById('flipbook');
        if (!flipbook) {
            console.error('Flipbook container not found!');
            return;
        }
        
        // Clear existing content
        flipbook.innerHTML = '';
        
        // Create loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading';
        loadingMessage.textContent = 'Loading flipbook...';
        flipbook.appendChild(loadingMessage);
        
        // Create pages
        createPages();
        
        // Initialize thumbnails if the container exists
        createThumbnails();
        
        // Setup navigation buttons
        setupNavigation();
        
        // Remove loading message when ready
        setTimeout(() => {
            const loading = document.querySelector('.loading');
            if (loading) loading.remove();
        }, 1500);
    }
    
    // Create all pages for the flipbook
    function createPages() {
        const flipbook = document.getElementById('flipbook');
        
        for (let i = 1; i <= totalPages; i++) {
            const page = document.createElement('div');
            page.className = 'page';
            page.setAttribute('data-page', i);
            
            // Only show first page initially, hide others
            if (i > 1) {
                page.style.display = 'none';
            }
            
            const img = document.createElement('img');
            const imgPath = `${imageBasePath}${imagePrefix}${i}${imageExtension}`;
            img.setAttribute('data-src', imgPath); // Use data-src for lazy loading
            
            // For the first few pages, load immediately
            if (i <= 3) {
                img.src = imgPath;
            }
            
            // Add page number
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = i;
            
            // Add to page
            page.appendChild(img);
            page.appendChild(pageNumber);
            flipbook.appendChild(page);
            
            // Add click event for navigation
            page.addEventListener('click', function(e) {
                // If click is on the right side, go to next page
                const clickX = e.clientX - page.getBoundingClientRect().left;
                const pageWidth = page.offsetWidth;
                
                if (clickX > pageWidth / 2) {
                    nextPage();
                } else {
                    prevPage();
                }
            });
            
            // Add image loading handlers
            setupImageLoading(img);
        }
    }
    
    // Create thumbnails
    function createThumbnails() {
        const thumbnailsContainer = document.querySelector('.thumbnails');
        if (!thumbnailsContainer) return;
        
        thumbnailsContainer.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const thumb = document.createElement('img');
            thumb.className = 'thumbnail';
            thumb.src = `${imageBasePath}${imagePrefix}${i}${imageExtension}`;
            thumb.setAttribute('data-page', i);
            thumb.alt = `Page ${i} thumbnail`;
            
            // Set first thumbnail as active
            if (i === 1) {
                thumb.classList.add('active');
            }
            
            // Add click event to navigate to page
            thumb.addEventListener('click', function() {
                goToPage(i);
            });
            
            thumbnailsContainer.appendChild(thumb);
            
            // Add loading handlers
            setupImageLoading(thumb);
        }
    }
    
    // Setup navigation buttons
    function setupNavigation() {
        const prevButton = document.querySelector('.controls button:first-child');
        const nextButton = document.querySelector('.controls button:last-child');
        
        if (prevButton) {
            prevButton.addEventListener('click', prevPage);
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', nextPage);
        }
        
        // Add keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight') {
                nextPage();
            } else if (e.key === 'ArrowLeft') {
                prevPage();
            }
        });
    }
    
    // Image loading and error handling function
    function setupImageLoading(img) {
        // Handle lazy loading
        if (img.getAttribute('data-src') && !img.src) {
            // Create observer for lazy loading
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        img.src = img.getAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            
            observer.observe(img);
        }
        
        // Add loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading...';
        if (img.parentNode) {
            img.parentNode.appendChild(loadingIndicator);
        }
        
        // Handle successful load
        img.addEventListener('load', function() {
            // Remove loading indicator if it exists
            const indicator = img.parentNode?.querySelector('.loading-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
        
        // Handle loading errors
        img.addEventListener('error', function() {
            // Remove loading indicator if it exists
            const indicator = img.parentNode?.querySelector('.loading-indicator');
            if (indicator) {
                indicator.remove();
            }
            
            // Add error class
            img.classList.add('error');
            
            // Attempt to reload the image
            if (img.getAttribute('data-retry') !== 'true') {
                // Try once more after a delay
                img.setAttribute('data-retry', 'true');
                setTimeout(() => {
                    const originalSrc = img.getAttribute('data-src') || img.src;
                    img.src = originalSrc + '?reload=' + new Date().getTime();
                }, 1000);
            } else {
                // If retry failed, use a placeholder
                img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%25%22 height%3D%22100%25%22 viewBox%3D%220 0 1 1%22%3E%3Crect width%3D%221%22 height%3D%221%22 fill%3D%22%23f8f8f8%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2250%25%22 font-size%3D%2220%22 text-anchor%3D%22middle%22 alignment-baseline%3D%22middle%22 font-family%3D%22Arial%2C sans-serif%22 fill%3D%22%23999%22%3EImage not available%3C%2Ftext%3E%3C%2Fsvg%3E';
            }
        });
    }
    
    // Navigation functions
    let currentPage = 1;
    
    function goToPage(pageNum) {
        if (pageNum < 1 || pageNum > totalPages) return;
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        
        // Show the target page
        const targetPage = document.querySelector(`.page[data-page="${pageNum}"]`);
        if (targetPage) {
            targetPage.style.display = 'block';
            
            // Preload the next few pages
            preloadPages(pageNum);
            
            // Update current page
            currentPage = pageNum;
            
            // Update thumbnails
            updateThumbnailHighlight(pageNum);
        }
    }
    
    function nextPage() {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    }
    
    function prevPage() {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    }
    
    // Preload nearby pages for smoother navigation
    function preloadPages(currentPageNum) {
        // Preload next 3 pages and previous page
        const preloadRange = 3;
        
        for (let i = currentPageNum + 1; i <= Math.min(currentPageNum + preloadRange, totalPages); i++) {
            const img = document.querySelector(`.page[data-page="${i}"] img`);
            if (img && img.getAttribute('data-src') && !img.src) {
                img.src = img.getAttribute('data-src');
            }
        }
        
        // Also preload previous page if not already loaded
        if (currentPageNum > 1) {
            const prevImg = document.querySelector(`.page[data-page="${currentPageNum - 1}"] img`);
            if (prevImg && prevImg.getAttribute('data-src') && !prevImg.src) {
                prevImg.src = prevImg.getAttribute('data-src');
            }
        }
    }
    
    // Update thumbnail highlight
    function updateThumbnailHighlight(pageNum) {
        // Remove active class from all thumbnails
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        
        // Add active class to current thumbnail
        const currentThumb = document.querySelector(`.thumbnail[data-page="${pageNum}"]`);
        if (currentThumb) {
            currentThumb.classList.add('active');
            
            // Scroll thumbnail into view if needed
            currentThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
    
    // Start with page 1
    goToPage(1);
});

// Progressive image loading function (if you have high-resolution images)
function loadProgressiveImages() {
    const images = document.querySelectorAll('[data-high-res]');
    
    images.forEach(img => {
        // Start with low-res version
        const highResSrc = img.getAttribute('data-high-res');
        
        if (highResSrc) {
            // Create a new image object to preload high-res version
            const highResImg = new Image();
            
            highResImg.onload = function() {
                // Once high-res is loaded, swap the src
                img.src = highResSrc;
                
                // Add a class for any transition effects
                img.classList.add('high-res-loaded');
            };
            
            // Start loading the high-res version
            highResImg.src = highResSrc;
        }
    });
}
