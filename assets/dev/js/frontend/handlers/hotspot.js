export default class Hotspot extends elementorModules.frontend.handlers.Base {
    getDefaultSettings() {
        return {
            selectors: {
                hotspot: '.e-hotspot',
                hotspotTrigger: '.e-hotspot__button',
                tooltip: '.e-hotspot__tooltip',
                //tooltipMask: '.e-hotspot__direction-mask',
            },
        };
    }

    getDefaultElements() {
        const selectors = this.getSettings( 'selectors' );
        return {
            $hotspot: this.$element.find( selectors.hotspot ),
            $hotspotTrigger: this.$element.find( selectors.hotspotTrigger ),
            $tooltip: this.$element.find( selectors.tooltip ),
            //$tooltipMask: this.$element.find( selectors.tooltipMask ),
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
		const isHotspotButtonEvent = jQuery( event.target ).is( '.e-hotspot__button' ) || jQuery( event.target ).parents( '.e-hotspot__button' ).length;
		const isTooltipMouseLeave = ( 'mouseleave' === event.type && ( jQuery( event.target ).is( '.e-tooltip-position' ) || jQuery( event.target ).parents( '.e-tooltip-position' ).length ) );

		if ( isHotspotButtonEvent || isTooltipMouseLeave ) {
            const currentHotspot = jQuery( event.currentTarget );
            this.elements.$hotspot.not( currentHotspot ).removeClass( 'e-hotspot--active' );
            currentHotspot.toggleClass( 'e-hotspot--active' );
        }
    }

    hotspotSequencedAnimation() {
		const isSequencedAnimation = this.getElementSettings( 'e-hotspot_sequenced_animation' );

        if ( isSequencedAnimation ) {
            const hotspotObserver = elementorModules.utils.Scroll.scrollObserver( { //start sequenced animation when element on viewport
                callback: ( event ) => {
                    if ( event.isInViewport ) {
                        hotspotObserver.unobserve( this.$element[ 0 ] );
                        this.elements.$hotspot.each( ( index, element ) => { //add delay for each hotspot
							element.style.animationDelay = ( ( index + 1 ) * 0.7 ) + 's';
                        } );
                        this.elements.$hotspot.addClass( 'e-hotspot--sequenced' );//add sequenced animation class
                    }
                },
            } );
            hotspotObserver.observe( this.$element[ 0 ] );
        }
    }

    setTooltipPositionControl() {
		const getElementSettings = this.getElementSettings();
		const isDirectionAnimation = 'undefined' !== typeof getElementSettings.tooltip_animation && ( getElementSettings.tooltip_animation.startsWith( 'e-hotspot--slide-direction' ) || getElementSettings.tooltip_animation.startsWith( 'e-hotspot--fade-direction' ) );

		if ( isDirectionAnimation ) {
            this.elements.$tooltip.removeClass( 'e-hotspot--tooltip-animation-from-left e-hotspot--tooltip-animation-from-top e-hotspot--tooltip-animation-from-right e-hotspot--tooltip-animation-from-bottom' );
            this.elements.$tooltip.addClass( 'e-hotspot--tooltip-animation-from-' + getElementSettings.tooltip_position );
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
