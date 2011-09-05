/*!
 * jQuery wmuSlider v1.0
 * 
 * Copyright (c) 2011 Brice Lechatellier
 * http://brice.lechatellier.com/
 *
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */

;(function($) {
    $.fn.wmuSlider = function(options) {
 
         /* Default Options
        ================================================== */       
        var defaults = {
            autoplay: false,
            autoplaySpeed: 4000,
            transitionSpeed: 400,
            showControlNav: true,
            showDirectionNav: true,
            showLoading: true,
            loadingText: 'Loading...',
            prevText: 'Previous',
            nextText: 'Next'
        };
        var options = $.extend(defaults, options);
        
        return this.each(function() {
        
            /* Variables
            ================================================== */
            var currentIndex;
            var slider = $(this);
            var sliderWidth;
            var strip = slider.find('ul');
            var slides = strip.find('li');
            var slidesCount = slides.length;
            var prev;
            var next;
            var sliderControl;
            var resizeInterval = 400;
            var autoplayTimeout;

            
            /* Slide
            ================================================== */
            var loadSlide = function(i) {                
                var slide = $(slides[i]);
                var img = slide.find('img');
                
                // Loading
                if (options.showLoading && img.attr('data-src')) {
                    slide.append('<span class="muLoading">' + options.loadingText + '</span>');
                }    
                            
                // Slide        
                strip.animate({ left: -i * sliderWidth }, options.transitionSpeed, function() {                
                
                    // Load Image
                    if (img) {
                        // Check if we need to dynamically load the image
                        if (img.attr('data-src')) {                    
                            img.css('opacity', 0);
                            img.load(function() {
                                // Animate the slider height to the image height
                                slider.animate({ height:img.height() }, options.transitionSpeed, function() {
                                    img.animate({ opacity:1 }, options.transitionSpeed, function() {
                                        $('.muLoading').remove();
                                    });
                                });
                            });
                            img.attr('src', img.attr('data-src'));
                            img.removeAttr('data-src');
                        // Image is already inline                   
                        } else {
                            slider.animate({ height:img.height() }, options.transitionSpeed);
                        }
                    }
                    if (sliderControl) {
                        sliderControl.find('a').each(function(j) {
                            if(j == i) {
                                $(this).addClass('muActive');
                            } else {
                                $(this).removeClass('muActive');
                            }
                        });
                    }
                    currentIndex = i;
                });
            };
            
            
            /* Touch Gesture
            ================================================== */
            var swipeStatus = function(event, phase, direction, distance) {
                if (autoplayTimeout) {
                    clearTimeout(autoplayTimeout);
                }
                
                if(phase == 'move' && (direction == 'left' || direction == 'right')) {
                    if (direction == 'right') {
                        strip.css('left', (-currentIndex * sliderWidth) + distance);
                    } else if (direction == 'left')    {        
                        strip.css('left', (-currentIndex * sliderWidth) - distance);
                    }
                } else if (phase == 'cancel' ) {
                    strip.animate({ left: -currentIndex * sliderWidth }, options.transitionSpeed);                
                } else if (phase == 'end' ) {
                    if (direction == 'right' && currentIndex > 0) {
                        loadSlide(currentIndex - 1);
                    } else if (direction == 'left' && currentIndex + 1 < slidesCount)    {        
                        loadSlide(currentIndex + 1);
                    } else {
                        strip.animate({ left: -currentIndex * sliderWidth }, options.transitionSpeed);
                    }
                }            
            };
            // Check if touch is supported and if the touchSwipe library has been loaded
            if (typeof Modernizr != 'undefined' && Modernizr.touch && $.isFunction($.fn.swipe)) {
                options.showDirectionNav = false;
                slider.swipe({ triggerOnTouchEnd:false, swipeStatus:swipeStatus, allowPageScroll:'vertical'});
            }
            
                        
            /* Direction Navigation
            ================================================== */
            if (options.showDirectionNav) {
                slider.append('<a href="#" class="muPrev">' + options.prevText + '</a>');
                slider.append('<a href="#" class="muNext">' + options.nextText + '</a>');
                prev = slider.find('.muPrev').hide();
                next = slider.find('.muNext').hide();
                slider.hover(function() {
                    prev.show();
                    next.show();
                }, function() {
                    prev.hide();
                    next.hide();            
                });
                prev.click(function(e) {
                    e.preventDefault();
                    if (autoplayTimeout) {
                        clearTimeout(autoplayTimeout);
                    }
                    if (currentIndex == 0) {
                        loadSlide(slidesCount - 1);
                    } else {
                        loadSlide(currentIndex - 1);
                    }
                });
                next.click(function(e) {
                    e.preventDefault();
                    if (autoplayTimeout) {
                        clearTimeout(autoplayTimeout);
                    }    
                    if (currentIndex + 1 == slidesCount) {    
                        loadSlide(0);
                    } else {
                        loadSlide(currentIndex + 1);
                    }
                });
            }
            
            
            /* Control Navigation
            ================================================== */
            if (options.showControlNav) {
                slider.append('<ul class="muControl"></ul>');
                sliderControl = slider.find('.muControl');
                $.each(slides, function(i) {
                    sliderControl.append('<li><a href="#">' + i + '</a></li>');
                    sliderControl.find('a:eq(' + i + ')').click(function(e) {    
                        e.preventDefault();
                        if (autoplayTimeout) {
                            clearTimeout(autoplayTimeout);
                        }    
                        loadSlide(i);
                    });                
                });
            }
            
            
            /* Autoplay
            ================================================== */
            if (options.autoplay) {
                var autoplaySlider = function(){
                    if (currentIndex + 1 < slidesCount) {
                        loadSlide(currentIndex + 1);
                    } else {
                        loadSlide(0);
                    }
                    autoplayTimeout = setTimeout(autoplaySlider, options.autoplaySpeed);
                };
                autoplayTimeout = setTimeout(autoplaySlider, options.autoplaySpeed);
            }
            
                    
            /* Resizer
            ================================================== */
            var resize = function(){
                sliderWidth = slider.width();
                // Position the slider on the current item
                strip.css({
                    left: -currentIndex * sliderWidth,
                    width: sliderWidth * slidesCount
                });
                slides.css({
                    width: sliderWidth
                });
                // Reset the slider height
                var slide = $(slides[currentIndex]);
                var img = slide.find('img');
                slider.css({
                    height: img.height()
                });            
            };
            // Check if the slider has been resized
            var checkSliderSize = function() {
                if (sliderWidth != slider.width()) {
                    resize();
                }
                setTimeout(checkSliderSize, resizeInterval);
            };
            setTimeout(checkSliderSize, resizeInterval);
            
            
            /* Init
            ================================================== */
            // Default CSS
            slider.css({
                position: 'relative',
                overflow: 'hidden'
            });
            strip.css({
                position: 'absolute',
                height: '100%'
            });
            slides.css({
                position: 'relative',
                float: 'left',
                height: '100%'
            });
            
            // Load first slide
            loadSlide(0);
            
        });
    };
})(jQuery);