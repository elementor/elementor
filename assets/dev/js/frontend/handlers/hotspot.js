export default class Hotspot extends elementorModules.frontend.handlers.Base {
    getDefaultSettings() {
        return {
            selectors: {
                hotspot: '.elementor-hotspot',
                hotspotTrigger: '.elementor-hotspot-trigger',
                tooltip: '.elementor-tooltip',
                tooltipMask: '.animation-direction-mask',
            },
        };
    }

    getDefaultElements() {
        const selectors = this.getSettings( 'selectors' );
        return {
            $hotspot: this.$element.find( selectors.hotspot ),
            $hotspotTrigger: this.$element.find( selectors.hotspotTrigger ),
            $tooltip: this.$element.find( selectors.tooltip ),
            $tooltipMask: this.$element.find( selectors.tooltipMask ),
        };
    }

    bindEvents() {
        const elementSettings = this.getElementSettings();
		const tooltipTriggerEvent = 'mouseenter' === elementSettings.tooltip_trigger ? 'mouseleave mouseenter' : elementSettings.tooltip_trigger;

        if ( tooltipTriggerEvent !== 'none' ) {
            this.elements.$hotspot.on( tooltipTriggerEvent, this.onHotspotTriggerEvent.bind( this ) );
        }
    }

    onHotspotTriggerEvent( event ) {
		const isHotspotButtonEvent = jQuery( event.target ).is( '.elementor-hotspot-trigger' ) || jQuery( event.target ).parents( '.elementor-hotspot-trigger' ).length;
		const isTooltipMouseLeave = ( 'mouseleave' === event.type && ( jQuery( event.target ).is( '.tooltip-position' ) || jQuery( event.target ).parents( '.tooltip-position' ).length ) );

		if ( isHotspotButtonEvent || isTooltipMouseLeave ) {
            const currentHotspot = jQuery( event.currentTarget );
            this.elements.$hotspot.not( currentHotspot ).removeClass( 'active' );
            currentHotspot.toggleClass( 'active' );
        }
    }

    hotspotSequencedAnimation() {
		const isSequencedAnimation = this.getElementSettings( 'hotspot_sequenced_animation' );

        if ( isSequencedAnimation ) {
            const hotspotObserver = elementorModules.utils.Scroll.scrollObserver( { //start sequenced animation when element on viewport
                callback: ( event ) => {
                    if ( event.isInViewport ) {
                        hotspotObserver.unobserve( this.$element[ 0 ] );
                        this.elements.$hotspot.each( ( index, element ) => { //add delay for each hotspot
							element.style.animationDelay = ( ( index + 1 ) * 0.7 ) + 's';
                        } );
                        this.elements.$hotspot.addClass( 'elementor-sequenced-animation' );//add sequenced animation class
                    }
                },
            } );
            hotspotObserver.observe( this.$element[ 0 ] );
        }
    }

    setTooltipPositionControl() {
		const getElementSettings = this.getElementSettings();
		const isDirectionAnimation = 'undefined' !== typeof getElementSettings.tooltip_animation && ( getElementSettings.tooltip_animation.startsWith( 'elementor-slide-direction' ) || getElementSettings.tooltip_animation.startsWith( 'elementor-fade-direction' ) );

		if ( isDirectionAnimation ) {
            this.elements.$tooltipMask.removeClass( 'animation-slide-from-left animation-slide-from-top animation-slide-from-right animation-slide-from-bottom' );
            this.elements.$tooltipMask.addClass( 'animation-slide-from-' + getElementSettings.tooltip_position );
        }
    }

    onInit( ...args ) {
        super.onInit( ...args );
        this.hotspotSequencedAnimation();
        this.setTooltipPositionControl();
    }

    onElementChange( propertyName ) {
		if ( propertyName.startsWith( 'tooltip_position' ) ) {
            this.setTooltipPositionControl();
		}
	}
}
