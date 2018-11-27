(function ($) {

        var d = document, w = window;
        var defaults = {
                handler       : window,
                delay         : 200,
                triggerBefore : 0,
                once          : true,
                advance       : false,
                advanceItems  : 50     
        };

        $.event.special.onExpose = {

                add: function( e, data ) {

                        var el = $(this);
                        var options = $.extend( {}, defaults, e.data );

                        if(options.advance){
                                el.attr('data-laod', 'advance');
                                el.data('expose', false);
                        }

                        onExpose( el, options );

                },
                trigger: function( e, data ){

                        var el = $(this);
                        var options = $.extend( {}, defaults, data );

                        var triggerBefore = options.triggerBefore,
                                inVpPartial   = isElementPartiallyInViewport(el, triggerBefore),
                                inVpFull      = isScrolledIntoView(el),
                elData        = el.data('expose');

                        if(options.once && !elData && (inVpPartial || inVpFull)){
                                el.data('expose', true);
                                el.trigger("onExpose",[inVpPartial, inVpFull]);
                        }
                }

        };

        function onExpose( el, options ){
                /* Every time the window is scrolled ... */

                $(options.handler).bind("load scroll resize scrollstop", function(event){
                        var triggerBefore = options.triggerBefore,
                                inVpPartial   = isElementPartiallyInViewport(el, triggerBefore),
                                inVpFull      = isScrolledIntoView(el),
                elData        = el.data('expose');

                if(options.once && !elData && (inVpPartial || inVpFull)){

                        //el.data('once', true);
                                el.data('expose', true);
                                el.trigger("onExpose",[inVpPartial, inVpFull]);

                                /* advance loading */
                                if(options.advance){

                                        el.removeAttr('data-laod');

                                        /* visible last element */
                                        var nextSet = $('[data-laod=advance]').slice(0,options.advanceItems);

                                        clearTimeout( $.data( el, "onExpose" ) );

                                        $.data( el, "onExpose", setTimeout(function() {
                                                nextSet.each(function(){
                                                        if($(this).data('expose') === false){
                                                                $(this).data('expose', true);
                                                                $(this).removeAttr('data-laod');
                                                                $(this).trigger("onExpose", [true, true]);
                                                        }
                                                });

                                        }, options.delay ));
                                }

                        } else if(!options.once) {
                                $.data( el, "onExpose", setTimeout(function() {
                                        el.trigger("onExpose",[inVpPartial, inVpFull]);
                                }, options.delay ));
                        }
                });
        }

        function isElementPartiallyInViewport(el, triggerBefore) {
                if (typeof jQuery !== "undefined" && el instanceof jQuery) el = el[0];
                var rect = el.getBoundingClientRect();
                var windowHeight = (w.innerHeight || d.documentElement.clientHeight);
                var windowWidth = (w.innerWidth || d.documentElement.clientWidth);
                var vertInView = ((rect.top - triggerBefore) <= windowHeight) && ((rect.top + rect.height) >= 0);
                var horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

                return (vertInView && horInView);
        }

        function isScrolledIntoView(el){
                if (typeof jQuery !== "undefined" && el instanceof jQuery) el = el[0];
                var rect = el.getBoundingClientRect();
                return (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= (w.innerHeight || d.documentElement.clientHeight) && /*or $(window).height() */
                        rect.right <= (w.innerWidth || d.documentElement.clientWidth) /*or $(window).width() */
                );
        }

})(jQuery);
