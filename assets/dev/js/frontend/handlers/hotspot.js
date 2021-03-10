export default class Hotspot extends elementorModules.frontend.handlers.Base {
    getDefaultSettings() {
        return {
            selectors: {
                hotspot: '.elementor-hotspot',
                hotspotTrigger: '.elementor-hotspot-trigger',
                tooltip: '.elementor-tooltip',
            },
        };
    }

    getDefaultElements() {
        const selectors = this.getSettings('selectors');
        return {
            $hotspot: this.$element.find(selectors.hotspot),
            $hotspotTrigger: this.$element.find(selectors.hotspotTrigger),
            $tooltip: this.$element.find(selectors.tooltip),
        };
    }

    bindEvents() {
        const elementSettings = this.getElementSettings();
        var tooltipTriggerEvent = elementSettings.tooltip_trigger;

        if (tooltipTriggerEvent !== 'none') {
            //tooltipTriggerEvent = (tooltipTriggerEvent !== 'hover') ? 'mouseenter' : tooltipTriggerEvent;
            this.elements.$hotspotTrigger.on(tooltipTriggerEvent, this.onHotspotTriggerEvent.bind(this));
        }
    }

    onHotspotTriggerEvent(event) {
        //hover or --click--
        //console.log(event);
        //console.log(event.type);
        
        const elementSettings = this.getElementSettings();
        const tooltipAnimation = elementSettings.tooltip_animation;
        //const animationDuration = elementSettings.tooltip_animation_duration.size;

        var currentTooltip = jQuery(event.currentTarget).parent('.elementor-hotspot').find('.elementor-tooltip');
        //var otherTooltips = this.elements.$tooltip.not(currentTooltip);

        if(event.type === 'mouseenter' && currentTooltip.is('.'+tooltipAnimation)){
            return;
        }

        this.elements.$tooltip.not(currentTooltip).removeClass(tooltipAnimation);
        currentTooltip.toggleClass(tooltipAnimation);

        // if(tooltipAnimation === 'elementor-fade-in-out'){
        //     otherTooltips.fadeOut(animationDuration);
        //     currentTooltip.fadeToggle(animationDuration);
        // }else if(tooltipAnimation === 'elementor-slide-direction'){
        //     otherTooltips.not(currentTooltip).slideUp(animationDuration);
        //     currentTooltip.slideToggle(animationDuration);
        // }else if(tooltipAnimation === 'elementor-fade-direction'){

        // }else if(tooltipAnimation === 'elementor-fade-grow'){

        // }else{

        // }
        
    }

    hotspotSequencedAnimation() {
        const elementSettings = this.getElementSettings();
        const isSequencedAnimation = elementSettings.hotspot_sequenced_animation;

        if (isSequencedAnimation) {
            const hotspotObserver = elementorModules.utils.Scroll.scrollObserver({//start sequenced animation when element on viewport
                callback: (event) => {
                    if (event.isInViewport) {
                        hotspotObserver.unobserve(this.$element[0]);
                        this.elements.$hotspot.each(function (index) {//add delay for each hotspot
                            this.style.animationDelay = (index + 1) * 0.7 + 's';
                        });
                        this.elements.$hotspot.addClass('elementor-sequenced-animation');//add sequenced animation class
                    }
                },
            });
            hotspotObserver.observe(this.$element[0]);
        }
    }

    onInit(...args) {
        super.onInit(...args);
        this.hotspotSequencedAnimation();
    }
}
