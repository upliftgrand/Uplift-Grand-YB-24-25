$(document).ready(function() {
    $("#flipbook").turn({
        width: '100%',
        height: '100%',
        autoCenter: true,
        display: 'double',
        acceleration: true,
        elevation: 50,
        gradients: true,
        when: {
            turning: function(event, page, view) {
                // Update page number display
                $('#page-num').text(page);
            }
        }
    });
    
    // Set total pages
    $('#total-pages').text($('#flipbook').turn('pages'));
    
    // Navigation controls
    $('#prev-btn').click(function() {
        $('#flipbook').turn('previous');
    });
    
    $('#next-btn').click(function() {
        $('#flipbook').turn('next');
    });
});
