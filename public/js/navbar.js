$(document).ready(function () {
    // When the user scrolls the page, execute myFunction
    window.onscroll = function () {
        myFunction();
    };

    // Get the navbar
    var navbar = $('#navbar')[0];
    // Get the offset position of the navbar
    var sticky = navbar.offsetTop;

    // Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
    function myFunction() {
        if (window.pageYOffset > sticky) {
            navbar.classList.add('fixed-top');
            $('header').css('margin-bottom', '89px');
        } else {
            navbar.classList.remove('fixed-top');
            $('header').removeAttr('style');
        }
    }

    
});
// scroll effect
$('.nav-link').each((index, element)=>{
    if(index > 0){
        $(element).click(()=>{
            if($(location).attr('href').split('/').pop() != $(element).prop('href').split('/').pop()){
            let offset = $($(element).prop('href').split('/').pop()).offset().top;
            $('html, body').animate({scrollTop: offset - 30 - $('#navbar').height()});
            }
        });           
    }
});