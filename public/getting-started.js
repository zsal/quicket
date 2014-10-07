
/* HTML Preloader
*********************************************************************************************/

$(window).load(function() {
    $("#overlay").delay(1000).fadeOut();
    $("section").delay(2000).css('opacity', '1');
});

/* Services Background Video
*********************************************************************************************/

$(document).ready(function() {
    if( screen.width > 1000 ) {
        //$( '<video class="embed" autoplay loop><source src="assets/media/atmospheric.webm" type="video/webm"><source src="assets/media/atmospheric.mp4" type="video/mp4"></video>' ).appendTo( '#services' );
    }
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

/* Mailchimp Form Handler
*********************************************************************************************/

$(document).ready( function () {
    var $form = $('#news form');
    
    if ( $form.length > 0 ) {
        $('#news form button').bind('click', function ( event ) {
            if ( event ) event.preventDefault();
            register($form);
        });
    }
});

function register($form) {
    $.ajax({
        type: $form.attr('method'),
        url: $form.attr('action'),
        data: $form.serialize(),
        cache       : false,
        dataType    : 'json',
        contentType: "application/json; charset=utf-8",
        error       : function(err) { alert("Could not connect to the registration server. Please try again later."); },
        success     : function(data) {
            if (data.result != "success") {
                alert("Oops! Something went wrong.");
            } else {
                $('#pre-subscribe').fadeOut(500);
                $('#post-subscribe').delay(500).fadeIn(500);
            }
        }
    });
}

/* Forms
*********************************************************************************************/

(function(e){var t,o={className:"autosizejs",append:"",callback:!1,resizeDelay:10},i='<textarea tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; padding: 0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden; transition:none; -webkit-transition:none; -moz-transition:none;"/>',n=["fontFamily","fontSize","fontWeight","fontStyle","letterSpacing","textTransform","wordSpacing","textIndent"],s=e(i).data("autosize",!0)[0];s.style.lineHeight="99px","99px"===e(s).css("lineHeight")&&n.push("lineHeight"),s.style.lineHeight="",e.fn.autosize=function(i){return this.length?(i=e.extend({},o,i||{}),s.parentNode!==document.body&&e(document.body).append(s),this.each(function(){function o(){var t,o;"getComputedStyle"in window?(t=window.getComputedStyle(u,null),o=u.getBoundingClientRect().width,e.each(["paddingLeft","paddingRight","borderLeftWidth","borderRightWidth"],function(e,i){o-=parseInt(t[i],10)}),s.style.width=o+"px"):s.style.width=Math.max(p.width(),0)+"px"}function a(){var a={};if(t=u,s.className=i.className,d=parseInt(p.css("maxHeight"),10),e.each(n,function(e,t){a[t]=p.css(t)}),e(s).css(a),o(),window.chrome){var r=u.style.width;u.style.width="0px",u.offsetWidth,u.style.width=r}}function r(){var e,n;t!==u?a():o(),s.value=u.value+i.append,s.style.overflowY=u.style.overflowY,n=parseInt(u.style.height,10),s.scrollTop=0,s.scrollTop=9e4,e=s.scrollTop,d&&e>d?(u.style.overflowY="scroll",e=d):(u.style.overflowY="hidden",c>e&&(e=c)),e+=w,n!==e&&(u.style.height=e+"px",f&&i.callback.call(u,u))}function l(){clearTimeout(h),h=setTimeout(function(){var e=p.width();e!==g&&(g=e,r())},parseInt(i.resizeDelay,10))}var d,c,h,u=this,p=e(u),w=0,f=e.isFunction(i.callback),z={height:u.style.height,overflow:u.style.overflow,overflowY:u.style.overflowY,wordWrap:u.style.wordWrap,resize:u.style.resize},g=p.width();p.data("autosize")||(p.data("autosize",!0),("border-box"===p.css("box-sizing")||"border-box"===p.css("-moz-box-sizing")||"border-box"===p.css("-webkit-box-sizing"))&&(w=p.outerHeight()-p.height()),c=Math.max(parseInt(p.css("minHeight"),10)-w||0,p.height()),p.css({overflow:"hidden",overflowY:"hidden",wordWrap:"break-word",resize:"none"===p.css("resize")||"vertical"===p.css("resize")?"none":"horizontal"}),"onpropertychange"in u?"oninput"in u?p.on("input.autosize keyup.autosize",r):p.on("propertychange.autosize",function(){"value"===event.propertyName&&r()}):p.on("input.autosize",r),i.resizeDelay!==!1&&e(window).on("resize.autosize",l),p.on("autosize.resize",r),p.on("autosize.resizeIncludeStyle",function(){t=null,r()}),p.on("autosize.destroy",function(){t=null,clearTimeout(h),e(window).off("resize",l),p.off("autosize").off(".autosize").css(z).removeData("autosize")}),r())})):this}})(window.jQuery||window.$);

$(document).ready(function(){
    $('textarea').autosize();   
});

$('textarea').keypress(function(e) {
    var tval = $('textarea').val(),
        tlength = tval.length,
        set = 600,
        remain = parseInt(set - tlength);
    $('p.characters').text(remain);
    if (remain <= 0 && e.which !== 0 && e.charCode !== 0) {
        $('textarea').val((tval).substring(0, tlength - 1))
    }
});

/* Form Processing
*********************************************************************************************/

$(function() {

    // Get the form.
    var form = $('#contact-form');
    
    // Get the messages div.
    var formMessages = $('.form-message');
    
    // Set up an event listener for the contact form.
    $(form).submit(function(e) {
    
        // Stop the browser from submitting the form.
        e.preventDefault();
    
        // Serialize the form data.
        var formData = $(form).serialize();
    
        // Submit the form using AJAX.
        $.ajax({
            type: 'POST',
            url: $(form).attr('action'),
            data: formData
        })
        
        .done(function(response) {
        
            // Make sure that the formMessages div has the 'success' class.
            $(formMessages).removeClass('error');
            $(formMessages).addClass('success');
            
            // Set the message text.
            $(formMessages).text(response);
            
            // Clear the form.
            $('#name').val('');
            $('#email').val('');
            $('#phone').val('');
            $('#message').val('');
        })
        
        .fail(function(data) {
        
            // Make sure that the formMessages div has the 'error' class.
            $(formMessages).removeClass('success');
            $(formMessages).addClass('error');
            
            // Set the message text.
            if (data.responseText !== '') {
                $(formMessages).text(data.responseText);
            } else {
            $(formMessages).text('Oops! An error occured and your message could not be sent.');
        }});
    });
});

/* Temporary
*********************************************************************************************/

$("#services a").click(function(){
    var myelement = $(this).attr("href")
    return false;
});