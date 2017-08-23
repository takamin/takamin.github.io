(function($) {
    $.fn.onresize = function(onresize) {
        this.each(function(i, element) {
            element.onresize = onresize;
            element.prevSize = {
                'width' : $(element).width(),
                'height' : $(element).height()
            };
            window.setInterval(function() {
                var width = $(element).width();
                var height = $(element).height();
                if(width != element.prevSize.width || height != element.prevSize.height) {
                    element.onresize.call(element, element.prevSize.width, element.prevSize.height);
                    element.prevSize.width = width;
                    element.prevSize.height = height;
                }
            }, 100);
        }); 
        return this;
    };
})(jQuery);

