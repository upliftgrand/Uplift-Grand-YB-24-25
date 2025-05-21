document.addEventListener('DOMContentLoaded', function() {
    const flipbook = document.getElementById('flipbook');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const pageDisplay = document.getElementById('page-display');
    const thumbnailsContainer = document.getElementById('thumbnails');
    const loading = document.getElementById('loading');
    
    const totalPages = 94;
    let currentPage = 1;
    let pagesLoaded = 0;
    let pages = [];
    
    // Preload all images
    function preloadImages() {
        for (let i = 1; i <= totalPages; i++) {
            const img = new Image();
            img.src = `page${i}.jpg`;
            img.onload = function() {
                pagesLoaded++;
                if (pagesLoaded === totalPages) {
                    initializeFlipbook();
                }
            };
            img.onerror = function() {
                console.error(`Failed to load image page${i}.jpg`);
                pagesLoaded++;
                if (pagesLoaded === totalPages) {
                    initializeFlipbook();
                }
            };
        }
    }
    
    function initializeFlipbook() {
        loading.style.display = 'none';
        flipbook.style.display = 'block';
        
        // Create pages
        for (let i = 1; i <= totalPages; i++) {
            const page = document.createElement('div');
            page.className = 'page';
            page.style.display = i === 1 ? 'block' : 'none';
            page.style.zIndex = totalPages - i;
            
            const img = document.createElement('img');
            img.src = `page${i}.jpg`;
            img.alt = `Page ${i}`;
            img.draggable = false;
            
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = i;
            
            page.appendChild(img);
            page.appendChild(pageNumber);
            flipbook.appendChild(page);
            pages.push(page);
            
            // Create thumbnail
            const thumbnail = document.createElement('img');
            thumbnail.className = 'thumbnail';
            thumbnail.src = `page${i}.jpg`;
            thumbnail.alt = `Thumbnail ${i}`;
            thumbnail.dataset.page = i;
            thumbnail.addEventListener('click', function() {
                goToPage(parseInt(this.dataset.page));
            });
            thumbnailsContainer.appendChild(thumbnail);
        }
        
        // Set first thumbnail as active
        updateActiveThumbnail();
        
        // Add click event to pages
        pages.forEach(page => {
            page.addEventListener('click', function(e) {
                // Only trigger page turn if clicking on the right side
                const pageRect = page.getBoundingClientRect();
                const clickX = e.clientX - pageRect.left;
                
                if (clickX > pageRect.width / 2) {
                    if (currentPage < totalPages) {
                        goToPage(currentPage + 1);
                    }
                } else {
                    if (currentPage > 1) {
                        goToPage(currentPage - 1);
                    }
                }
            });
        });
    }
    
    function updateActiveThumbnail() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, index) => {
            if (index + 1 === currentPage) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    function animatePageTurn(from, to) {
        // Only animate if going forward one page
        if (to === from + 1) {
            const currentPageElem = pages[from - 1];
            currentPageElem.classList.add('turning');
            
            setTimeout(() => {
                currentPageElem.style.display = 'none';
                currentPageElem.classList.remove('turning');
                pages[to - 1].style.display = 'block';
            }, 250);
        } else {
            // For all other navigation, just switch pages
            pages[from - 1].style.display = 'none';
            pages[to - 1].style.display = 'block';
        }
    }
    
    function goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        
        // Animate page turn
        animatePageTurn(currentPage, pageNumber);
        
        // Update current page
        currentPage = pageNumber;
        
        // Update page display
        pageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
        
        // Update active thumbnail
        updateActiveThumbnail();
        
        // Scroll thumbnail into view
        const activeThumb = document.querySelector('.thumbnail.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    }
    
    prevBtn.addEventListener('click', function() {
        goToPage(currentPage - 1);
    });
    
    nextBtn.addEventListener('click', function() {
        goToPage(currentPage + 1);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            goToPage(currentPage - 1);
        } else if (e.key === 'ArrowRight') {
            goToPage(currentPage + 1);
        } else if (e.key === 'Home') {
            goToPage(1);
        } else if (e.key === 'End') {
            goToPage(totalPages);
        }
    });
    
    // Mouse wheel navigation
    document.addEventListener('wheel', function(e) {
        // Debounce wheel events to prevent too rapid navigation
        if (this.wheelTimeout) {
            clearTimeout(this.wheelTimeout);
        }
        
        this.wheelTimeout = setTimeout(() => {
            if (e.deltaY > 0) {
                goToPage(currentPage + 1);
            } else {
                goToPage(currentPage - 1);
            }
        }, 100);
    });
    
    // Touch swipe navigation
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            goToPage(currentPage + 1); // Swipe left
        }
        if (touchEndX > touchStartX + 50) {
            goToPage(currentPage - 1); // Swipe right
        }
    }
    
    // Initialize
    preloadImages();
});
