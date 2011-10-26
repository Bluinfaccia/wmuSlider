/*!
 * jQuery wmuGallery v1.0
 * 
 * Copyright (c) 2011 Brice Lechatellier
 * http://brice.lechatellier.com/
 *
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */
 
 ;(function($) {
    
    $.fn.wmuGallery = function(options) {

        /* Default Options
        ================================================== */       
        var defaults = {
            position: 'before',
            touch: false,
            slide: 'article',
            items: 5
        };
        var options = $.extend(defaults, options);
        
        return this.each(function() {

            /* Variables
            ================================================== */        
            var $this = $(this);
            var slides = $this.find(options.slide);
            var gallery; 
            var image;
            var slider;
            
            /* Slider
            ================================================== */  
            var loadImage = function(i) {
                var imageURI = $(slides[i]).find('img').attr('data-src-full');
                image.html('<img src="' + imageURI + '" />');
            };

            /* Init
            ================================================== */
            var init = function() {
                image = $('<figure></figure>');
                gallery = $('<div class="wmuGalleryImage"></div>');
                gallery.append(image);
                if (options.position == 'before') {
                    $this.prepend(gallery);
                } else if  (options.position == 'after') {
                    $this.append(gallery);
                }               
                
                if (!$.isFunction($.fn.wmuSlider)) {
                    $.ajax({
                        url: 'jquery.wmuSlider.min.js',
                        async: false
                    });
                }   
                if ($.isFunction($.fn.wmuSlider)) {             
                    slider = $this.find('.wmuSlider');
                    slider.bind('hasLoaded', function(e) {
                        var prev = slider.find('.wmuSliderPrev');
                        var next = slider.find('.wmuSliderNext');
                        var pagination = slider.find('.wmuSliderPagination');
                        gallery.append(prev);
                        gallery.append(next);
                        gallery.append(pagination);
                        slides = $this.find(options.slide);
                        slides.each(function(i) {
                            var slide = $(this);
                            slide.click(function(e) {
                                e.preventDefault();
                                slider.trigger('loadSlide', parseInt(slide.attr('data-index')));
                            });
                        });
                    }).bind('slideLoaded', function(e, i) {
                        loadImage(i);
                    }).wmuSlider({
                        touch: options.touch,
                        animation: 'slide',
                        slide: options.slide,
                        items: options.items
                    });
                }         
            };
            init();
            
        });
    }
    
})(jQuery);