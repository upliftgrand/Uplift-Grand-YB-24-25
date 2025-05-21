document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const flipbook = document.getElementById('flipbook');
    const pages = document.querySelectorAll('.page');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageNum = document.getElementById('page-num');
    const totalPages = document.getElementById('total-pages');
    const zoomSlider = document.getElementById('zoom-slider');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const container = document.querySelector('.container');
    
    // State
    let currentPage = 0;
    let scale = 1;
    
    // Initialize
    function init() {
        updatePageDisplay();
        totalPages.textContent = pages.length;
        
        // Set up event listeners
        prevBtn.addEventListener('click', prevPage);
        nextBtn.addEventListener('click', nextPage);
        zoomSlider.addEventListener('input', handleZoom);
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        
        // Add touch/mouse events for flipping
        pages.forEach((page) => {
            page.addEventListener('click', function(e) {
                const rect = page.getBoundingClientRect();
                const x = e.clientX - rect.left;
                
                // If clicked on right side, go next, if left side, go prev
                if (x > rect.width / 2) {
                    nextPage();
                } else {
                    prevPage();
                }
            });
        });
        
        // Handle keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                nextPage();
            } else if (e.key === 'ArrowLeft') {
                prevPage();
            }
        });
        
        // Preload images for better performance
        preloadImages();
    }
    
    // Update the page display
    function updatePageDisplay() {
        pages.forEach((page) => {
            page.classList.remove('active');
            page.classList.remove('flipped');
        });
        
        pages[currentPage].classList.add('active');
        
        // Display page number
        pageNum.textContent = currentPage + 1;
        
        // Enable/disable buttons
        prevBtn.disabled = currentPage === 0;
        next
