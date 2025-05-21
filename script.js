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
    
    // Initialize flipbook immediately and load images progressively
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
            img.dataset.src = `page${i}.jpg`; // Use data-src initially
            img.alt = `Page ${i}`;
            img.draggable = false;
            
            // Add loading placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'loading-placeholder';
            placeholder.textContent = `Loading page ${i}...`;
            page.appendChild(placeholder);
            
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = i;
            
            page.appendChild(img);
            page.appendChild(pageNumber);
            flipbook.appendChild(page);
            pages.push(page);
            
            // Create thumbnail with placeholder
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'thumbnail-container';
            
            const thumbnail = document.createElement('img');
            thumbnail.className = 'thumbnail';
            thumbnail.dataset.src = `page${i}.jpg`; // Use data-src initially
            thumbnail.alt = `Thumbnail ${i}`;
            thumbnail.dataset.page = i;
            
            // Add placeholder for thumbnail
            const thumbPlaceholder = document.createElement('div');
            thumbPlaceholder.className = 'thumbnail-placeholder';
            thumbPlaceholder.textContent = i;
            thumbnailContainer.appendChild(thumbPlaceholder);
            
            thumbnailContainer.appendChild(thumbnail);
            thumbnailContainer.addEventListener('click', function() {
                goToPage(parseInt(thumbnail.dataset.page));
            });
            
            thumbnailsContainer.appendChild(thumbnailContainer);
        }
        
        // Set first thumbnail as active
        updateActiveThumbnail();
        
        // Start loading images progressively
        loadImagesProgressively();
        
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
        
        // Set initial page display
        pageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    // Load images progressively, prioritizing current and adjacent pages
    function loadImagesProgressively() {
        // First, load the first few pages and their thumbnails
        const priorityPages = 5;
        for (let i = 1; i <= Math.min(priorityPages, totalPages); i++) {
            loadPageImage(i);
            loadThumbnailImage(i);
        }
        
        // Then load the rest with a small delay between each
        let nextPageToLoad = priorityPages + 1;
        
        function loadNextBatch() {
            if (nextPageToLoad <= totalPages) {
                const batchSize = 3; // Load 3 pages at a time
                const endPage = Math.min(nextPageToLoad + batchSize - 1, totalPages);
                
                for (let i = nextPageToLoad; i <= endPage; i++) {
                    loadPageImage(i);
                    loadThumbnailImage(i);
                }
                
                nextPageToLoad = endPage + 1;
                setTimeout(loadNextBatch, 100); // Small delay to prevent blocking UI
            }
        }
        
        setTimeout(loadNextBatch, 300); // Start loading the rest after a delay
    }
    
    // Load a specific page image
    function loadPageImage(pageNum) {
        const pageIndex = pageNum - 1;
        if (pageIndex >= 0 && pageIndex < pages.length) {
            const page = pages[pageIndex];
            const img = page.querySelector('img');
            const placeholder = page.querySelector('.loading-placeholder');
            
            if (img && img.dataset.src && !img.src) {
                img.onload = function() {
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    img.style.display = 'block';
                    pagesLoaded++;
                };
                
                img.onerror = function() {
                    console.error(`Failed to load image ${img.dataset.src}`);
                    if (placeholder) {
                        placeholder.textContent = 'Failed to load image';
                        placeholder.classList.add('error');
                    }
                    pagesLoaded++;
                    
                    // Retry loading after a delay (optional)
                    setTimeout(() => {
                        if (!img.src) {
                            img.src = img.dataset.src + '?retry=' + new Date().getTime();
                        }
                    }, 2000);
                };
                
                img.src = img.dataset.src;
            }
        }
    }
    
    // Load a specific thumbnail image
    function loadThumbnailImage(pageNum) {
        const thumbnails = document.querySelectorAll('.thumbnail-container');
        if (pageNum <= thumbnails.length) {
            const container = thumbnails[pageNum - 1];
            const thumbnail = container.querySelector('.thumbnail');
            const placeholder = container.querySelector('.thumbnail-placeholder');
            
            if (thumbnail && thumbnail.dataset.src && !thumbnail.src) {
                thumbnail.onload = function() {
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    thumbnail.style.display = 'block';
                };
                
                thumbnail.onerror = function() {
                    console.error(`Failed to load thumbnail ${thumbnail.dataset.src}`);
                    // Keep the placeholder visible on error
                };
                
                thumbnail.src = thumbnail.dataset.src;
            }
        }
    }
    
    function updateActiveThumbnail() {
        const thumbnailContainers = document.querySelectorAll('.thumbnail-container');
        thumbnailContainers.forEach((container, index) => {
            if (index + 1 === currentPage) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        });
    }
    
    function animatePageTurn(from, to) {
        // Ensure the target page image is loaded before turning
        loadPageImage(to);
        
        // If adjacent pages aren't loaded yet, load them too
        if (to + 1 <= totalPages) loadPageImage(to + 1);
        if (to - 1 >= 1) loadPageImage(to - 1);
        
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
        const activeThumb = document.querySelector('.thumbnail-container.active');
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
    
    // Mouse wheel navigation with debounce
    let wheelTimeout = null;
    document.addEventListener('wheel', function(e) {
        if (wheelTimeout) {
            clearTimeout(wheelTimeout);
        }
        
        wheelTimeout = setTimeout(() => {
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
    
    // Initialize immediately instead of waiting for all images
    initializeFlipbook();
});
