if(!String.linkify) {
    String.prototype.linkify = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
            .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
            .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
            .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    };
}

var mywindow = $(window);
var mypos = mywindow.scrollTop();
var up = false;
var newscroll;
mywindow.scroll(function () {
    newscroll = mywindow.scrollTop();
    if (newscroll > mypos && !up) {
        if($('#messageText').is(':focus')){
            $('#navbar').stop().fadeOut();
            up = !up;
        } else {
            $('#navbar').stop().fadeOut();
            $('form').stop().fadeOut();
            up = !up;
        }
        //console.log(up);
    } else if(newscroll < mypos && up) {
        $('#navbar').stop().fadeIn();
        $('form').stop().fadeIn();
        up = !up;
    }
    mypos = newscroll;
});
    var $body = jQuery('body'); 
    $(document)
    .on('focus', 'input', function(e) {
        $body.addClass('fixfixed');
    })
    .on('blur', 'input', function(e) {
        $body.removeClass('fixfixed');
    });