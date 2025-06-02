/**
 * Digital Flipbook Application
 * Handles loading and navigation of page0.jpg through page95.jpg
 */

class DigitalFlipbook {
    constructor() {
        // Configuration
        this.config = {
            totalPages: 94,
            imageBasePath: './',  // Adjust this path if images are in a subfolder (e.g., './images/')
            imagePrefix: 'page',
            imageExtension: '.jpg',
            preloadRange: 3,
            transitionDuration: 500,
            retryAttempts: 2,
            retryDelay: 1000
        };
        
        // State
        this.currentPage = 1;
        this.isLoading = false;
        this.loadedImages = new Set();
        this.failedImages = new Set();
        
        // DOM elements
        this.flipbook = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.currentPageSpan = null;
        this.totalPagesSpan = null;
        this.thumbnailsContainer = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the flipbook
     */
    init() {
        console.log('Initializing Digital Flipbook...');
        
        // Get DOM elements
        this.getDOMElements();
        
        if (!this.flipbook) {
            console.error('Flipbook container not found!');
            return;
        }
        
        // Update total pages display
        if (this.totalPagesSpan) {
            this.totalPagesSpan.textContent = this.config.totalPages;
        }
        
        // Setup the flipbook
        this.createPages();
        this.createThumbnails();
        this.setupNavigation();
        this.setupKeyboardEvents();
        this.setupResizeHandler();
        
        // Start with page 1
        this.goToPage(1);
        
        // Remove initial loading after a delay
        setTimeout(() => {
            const initialLoading = document.getElementById('initial-loading');
            if (initialLoading) {
                initialLoading.style.opacity = '0';
                setTimeout(() => initialLoading.remove(), 300);
            }
        }, 1500);
        
        console.log('Flipbook initialized successfully');
    }
    
    /**
     * Get references to DOM elements
     */
    getDOMElements() {
        this.flipbook = document.getElementById('flipbook');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.currentPageSpan = document.getElementById('current-page');
        this.totalPagesSpan = document.getElementById('total-pages');
        this.thumbnailsContainer = document.getElementById('thumbnails');
    }
    
    /**
     * Create all pages for the flipbook
     */
    createPages() {
        console.log('Creating pages...');
        
        for (let i = 1; i <= this.config.totalPages; i++) {
            const page = this.createPage(i);
            this.flipbook.appendChild(page);
        }
    }
    
    /**
     * Create a single page element
     */
    createPage(pageNumber) {
        const page = document.createElement('div');
        page.className = 'page';
        page.setAttribute('data-page', pageNumber);
        page.style.display = pageNumber === 1 ? 'block' : 'none';
        
        // Create image element
        const img = document.createElement('img');
        const imgPath = this.getImagePath(pageNumber);
        img.setAttribute('data-src', imgPath);
        img.setAttribute('data-page', pageNumber);
        img.alt = `Page ${pageNumber}`;
        
        // Load first few pages immediately
        if (pageNumber <= 3) {
            this.loadImage(img, imgPath);
        }
        
        // Create page number indicator
        const pageNumber_div = document.createElement('div');
        pageNumber_div.className = 'page-number';
        pageNumber_div.textContent = `${pageNumber}`;
        
        // Add elements to page
        page.appendChild(img);
        page.appendChild(pageNumber_div);
        
        // Add click handlers
        this.addPageClickHandlers(page);
        
        return page;
    }
    
    /**
     * Add click handlers to a page
     */
    addPageClickHandlers(page) {
        let clickCount = 0;
        let clickTimeout = null;
        
        page.addEventListener('click', (e) => {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimeout = setTimeout(() => {
                    // Single click - navigate
                    this.handlePageClick(e, page);
                    clickCount = 0;
                }, 250);
            } else if (clickCount === 2) {
                // Double click - zoom
                clearTimeout(clickTimeout);
                this.toggleZoom(page);
                clickCount = 0;
            }
        });
    }
    
    /**
     * Handle single click on page for navigation
     */
    handlePageClick(e, page) {
        if (page.classList.contains('zoomed')) {
            return; // Don't navigate when zoomed
        }
        
        const rect = page.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pageWidth = rect.width;
        
        // Click on right side = next page, left side = previous page
        if (clickX > pageWidth / 2) {
            this.nextPage();
        } else {
            this.prevPage();
        }
    }
    
    /**
     * Create thumbnail navigation
     */
    createThumbnails() {
        if (!this.thumbnailsContainer) return;
        
        console.log('Creating thumbnails...');
        
        for (let i = 1; i <= this.config.totalPages; i++) {
            const thumb = this.createThumbnail(i);
            this.thumbnailsContainer.appendChild(thumb);
        }
    }
    
    /**
     * Create a single thumbnail
     */
    createThumbnail(pageNumber) {
        const thumb = document.createElement('img');
        thumb.className = 'thumbnail';
        thumb.setAttribute('data-page', pageNumber);
        thumb.alt = `Page ${pageNumber} thumbnail`;
        
        const imgPath = this.getImagePath(pageNumber);
        thumb.setAttribute('data-src', imgPath);
        
        // Set first thumbnail as active
        if (pageNumber === 1) {
            thumb.classList.add('active');
        }
        
        // Add click handler
        thumb.addEventListener('click', () => this.goToPage(pageNumber));
        
        // Setup lazy loading for thumbnails
        this.setupLazyLoading(thumb);
        
        return thumb;
    }
    
    /**
     * Setup navigation buttons and events
     */
    setupNavigation() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevPage());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextPage());
        }
    }
    
    /**
     * Setup keyboard event handlers
     */
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for navigation keys
            if (['ArrowLeft', 'ArrowRight', ' ', 'Escape'].includes(e.key)) {
                e.preventDefault();
            }
            
            switch (e.key) {
                case 'ArrowRight':
                case ' ': // Spacebar
                    this.nextPage();
                    break;
                case 'ArrowLeft':
                    this.prevPage();
                    break;
                case 'Home':
                    this.goToPage(1);
                    break;
                case 'End':
                    this.goToPage(this.config.totalPages);
                    break;
                case 'Escape':
                    this.handleEscape();
                    break;
            }
        });
    }
    
    /**
     * Handle escape key press
     */
    handleEscape() {
        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        
        // Exit zoom
        const zoomedPage = document.querySelector('.page.zoomed');
        if (zoomedPage) {
            this.toggleZoom(zoomedPage);
        }
    }
    
    /**
     * Setup window resize handler
     */
    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Force layout recalculation
        if (this.flipbook) {
            const display = this.flipbook.style.display;
            this.flipbook.style.display = 'none';
            this.flipbook.offsetHeight; // Trigger reflow
            this.flipbook.style.display = display;
        }
    }
    
    /**
     * Navigate to specific page
     */
    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.config.totalPages || pageNumber === this.currentPage) {
            return;
        }
        
        console.log(`Navigating to page ${pageNumber}`);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
            page.classList.remove('zoomed');
        });
        
        // Show target page
        const targetPage = document.querySelector(`.page[data-page="${pageNumber}"]`);
        if (targetPage) {
            targetPage.style.display = 'block';
            
            // Load the image if not already loaded
            const img = targetPage.querySelector('img');
            if (img && !this.loadedImages.has(pageNumber)) {
                this.loadImage(img, this.getImagePath(pageNumber));
            }
            
            // Update state
            this.currentPage = pageNumber;
            
            // Update UI
            this.updatePageInfo();
            this.updateThumbnailHighlight();
            this.updateNavigationButtons();
            
            // Preload nearby pages
            this.preloadPages(pageNumber);
        }
    }
    
    /**
     * Go to next page
     */
    nextPage() {
        if (this.currentPage < this.config.totalPages) {
            this.addPageTurnAnimation('next');
            setTimeout(() => {
                this.goToPage(this.currentPage + 1);
            }, this.config.transitionDuration / 2);
        }
    }
    
    /**
     * Go to previous page
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.addPageTurnAnimation('prev');
            setTimeout(() => {
                this.goToPage(this.currentPage - 1);
            }, this.config.transitionDuration / 2);
        }
    }
    
    /**
     * Add page turn animation
     */
    addPageTurnAnimation(direction) {
        const currentPageElement = document.querySelector(`.page[data-page="${this.currentPage}"]`);
        if (currentPageElement) {
            currentPageElement.classList.add('turning');
            setTimeout(() => {
                currentPageElement.classList.remove('turning');
            }, this.config.transitionDuration);
        }
    }
    
    /**
     * Update page information display
     */
    updatePageInfo() {
        if (this.currentPageSpan) {
            this.currentPageSpan.textContent = this.currentPage;
        }
    }
    
    /**
     * Update navigation button states
     */
    updateNavigationButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentPage === 1;
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentPage === this.config.totalPages;
        }
    }
    
    /**
     * Update thumbnail highlighting
     */
    updateThumbnailHighlight() {
        // Remove active class from all thumbnails
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        
        // Add active class to current thumbnail
        const currentThumb = document.querySelector(`.thumbnail[data-page="${this.currentPage}"]`);
        if (currentThumb) {
            currentThumb.classList.add('active');
            
            // Scroll thumbnail into view
            currentThumb.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    /**
     * Preload nearby pages for smooth navigation
     */
    preloadPages(currentPageNum) {
        const range = this.config.preloadRange;
        
        // Preload next pages
        for (let i = currentPageNum + 1; i <= Math.min(currentPageNum + range, this.config.totalPages); i++) {
            this.preloadPage(i);
        }
        
        // Preload previous pages
        for (let i = Math.max(currentPageNum - range, 1); i < currentPageNum; i++) {
            this.
