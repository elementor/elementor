import Base from 'elementor-frontend/handlers/base';

export default class FloatingBarsHandler extends Base {
	getDefaultSettings() {

		return {
			selectors: {
				main: '.e-floating-bars',
				closeButton: '.e-floating-bars__close-button',
				ctaButton: '.e-floating-bars__cta-button',
			},
			constants: {
				ctaEntranceAnimation: 'style_cta_button_animation',
				mainEntranceAnimation: 'style_floating_bar_animation',
				hasEntranceAnimation: 'has-entrance-animation',
				visible: 'visible',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			main: this.$element[ 0 ].querySelector( selectors.main ),
			closeButton: this.$element[ 0 ].querySelector( selectors.closeButton ),
			ctaButton: this.$element[ 0 ].querySelector( selectors.ctaButton ),
		};
	}

	getResponsiveSetting( controlName ) {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), controlName, '', currentDevice );
	}

	bindEvents() {
		const { ctaEntranceAnimation, mainEntranceAnimation } = this.getSettings( 'constants' );

		if ( this.elements.closeButton ) {
			this.elements.closeButton.addEventListener( 'click', this.onCloseButtonClick.bind( this ) );
		}

		if ( this.elements.ctaButton ) {
			this.elements.ctaButton.addEventListener( 'animationend', this.removeEntranceAnimationClasses.bind( this, this.elements.ctaButton, ctaEntranceAnimation ) );
		}

		if ( this.elements.main ) {
			this.elements.main.addEventListener( 'animationend', this.removeEntranceAnimationClasses.bind( this, this.elements.main, mainEntranceAnimation ) );
		}
	}

	onCloseButtonClick() {
		this.elements.main.classList.add( 'is-hidden' );
	}

	initEntranceAnimation( element, animation ) {
		const { none } = this.getSettings( 'constants' );

		const entranceAnimationControl = this.getResponsiveSetting( animation );

		if ( ! entranceAnimationControl || none === entranceAnimationControl ) {
			return;
		}

		element.classList.add( entranceAnimationControl );
	}

	removeEntranceAnimationClasses( element, animation ) {
		if ( ! element ) {
			return;
		}

		const { visible } = this.getSettings( 'constants' );

		element.classList.remove( animation );
		element.classList.add( visible );
	}

	onInit( ...args ) {
		const { hasEntranceAnimation, ctaEntranceAnimation, mainEntranceAnimation } = this.getSettings( 'constants' );

		super.onInit( ...args );

		if ( this.elements.ctaButton && this.elements.ctaButton.classList.contains( hasEntranceAnimation ) ) {
			this.initEntranceAnimation( this.elements.ctaButton, ctaEntranceAnimation );
		}

		if ( this.elements.main && this.elements.main.classList.contains( hasEntranceAnimation ) ) {
			this.initEntranceAnimation( this.elements.main, mainEntranceAnimation );
		}

		jQuery( '[data-widget_type^="floating-bars"]' ).each( ( index, element ) => {
			if ( jQuery( element ).find( '.e-floating-bars' ).hasClass( 'has-vertical-position-top' ) ) {
				elementorFrontend.elements.$body.prepend( element );
			}
		} );
	}
}
