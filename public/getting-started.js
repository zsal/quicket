
/* HTML Preloader
*********************************************************************************************/

$(window).load(function() {
    $("#overlay").delay(1000).fadeOut();
    $("section").delay(2000).css('opacity', '1');
});

/* Vertical Centering
*********************************************************************************************/

$('.centered').each(function(){
    $container = $(this);
    $section = $container.parent();
    var margin_top = ($section.height() - $container.height())/2;
    $container.css('margin-top',margin_top);
});

/* Equal Heights
*********************************************************************************************/

function equalHeight(group) {
    var tallest = 0;
	
    group.each(function() {
        var thisHeight = $(this).height();
        if(thisHeight > tallest) {
            tallest = thisHeight;
        }
    });
	
    group.height(tallest);
}

$(document).ready(function() {
    if( screen.width > 1000 ) {
        equalHeight($("#services .column"));
    }
});

/* Menu Scrolling & ScrollSpy
*********************************************************************************************/

// Cache selectors
var lastId,
topMenu = $("#navigation"),
topMenuHeight = topMenu.outerHeight()+15,

// All list items.
menuItems = topMenu.find("a"),

// Anchors corresponding to menu items.
scrollItems = menuItems.map(function(){
    var item = $($(this).attr("href"));
    if (item.length) { return item; }
});


// Fancy scrolling.
$('a[href*=#]:not([href=#])').click(function(e){
    var href = $(this).attr("href"),
        offsetTop = href === "#" ? 0 : $(href).offset().top;
    $('html, body').stop().animate({ 
        scrollTop: offsetTop
    }, 500);
    e.preventDefault();
});

// Bind to scroll.
$(window).scroll(function(){

    // Get container scroll position.
    var fromTop = $(this).scrollTop()+topMenuHeight;
    
    // Get ID of current scroll item.
    var cur = scrollItems.map(function(){
        if ($(this).offset().top < fromTop)
            return this;
    });

    // Get the ID of the current element.
    cur = cur[cur.length-1];
    var id = cur && cur.length ? cur[0].id : "";

    if (lastId !== id) {
        $('body').attr("class", ""+id+"");
       
        lastId = id;
       
        // Add or remove "current" class.
        menuItems
            .parent().removeClass("current")
            .end().filter("[href=#"+id+"]").parent().addClass("current");
    }                   
});

$("#services a").click(function(){
    var myelement = $(this).attr("href")
    return false;
});