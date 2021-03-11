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
        var tooltipTriggerEvent = elementSettings.tooltip_trigger;

        if ( tooltipTriggerEvent !== 'none' ) {
            this.elements.$hotspotTrigger.on( tooltipTriggerEvent, this.onHotspotTriggerEvent.bind( this ) );
        }
    }

    onHotspotTriggerEvent( event ) {
        const elementSettings = this.getElementSettings();
        const tooltipAnimation = elementSettings.tooltip_animation;

        var currentTooltip = jQuery( event.currentTarget ).parent( '.elementor-hotspot' ).find( '.elementor-tooltip' );

        if ( 'mouseenter' === event.type && currentTooltip.is( '.' + tooltipAnimation ) ) {
            return;
        }

        this.elements.$tooltip.not( currentTooltip ).removeClass( tooltipAnimation );
        currentTooltip.toggleClass( tooltipAnimation );
    }

    hotspotSequencedAnimation() {
        const elementSettings = this.getElementSettings();
        const isSequencedAnimation = elementSettings.hotspot_sequenced_animation;

        if ( isSequencedAnimation ) {
            const hotspotObserver = elementorModules.utils.Scroll.scrollObserver( { //start sequenced animation when element on viewport
                callback: ( event ) => {
                    if ( event.isInViewport ) {
                        hotspotObserver.unobserve( this.$element[ 0 ] );
                        this.elements.$hotspot.each( function( index ) { //add delay for each hotspot
                            this.style.animationDelay = ( ( index + 1 ) * 0.7 ) + 's';
                        } );
                        this.elements.$hotspot.addClass( 'elementor-sequenced-animation' );//add sequenced animation class
                    }
                },
            } );
            hotspotObserver.observe( this.$element[ 0 ] );
        }
    }

    setTooltipPositionControl() {
        var getElementSettings = this.getElementSettings();
        var isDirectionAnimation = ( 0 === getElementSettings.tooltip_animation.indexOf( 'elementor-slide-direction' ) ) || ( 0 === getElementSettings.tooltip_animation.indexOf( 'elementor-fade-direction' ) );
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
		if ( 0 === propertyName.indexOf( 'tooltip_position' ) ) {
            this.setTooltipPositionControl();
		}
	}
}
