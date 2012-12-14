$(document).ready(function(){
    var os = $('.widget').offset().top;
    window.onscroll=function() {
        if (!matchMedia('screen and (max-width: 640px)').matches){
        if (window.pageYOffset > os-5)
            $('.widget').offset({top: (window.pageYOffset+5)});
        else $('.widget').offset({top: os});
   } 
   }
});