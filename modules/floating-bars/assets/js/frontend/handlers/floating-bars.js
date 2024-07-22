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
			mainAll: this.$element[ 0 ].querySelectorAll( selectors.main ),
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
			this.elements.closeButton.addEventListener( 'click', this.closeFloatingBar.bind( this ) );
		}

		if ( this.elements.ctaButton ) {
			this.elements.ctaButton.addEventListener( 'animationend', this.removeEntranceAnimationClasses.bind( this, this.elements.ctaButton, ctaEntranceAnimation ) );
		}

		if ( this.elements.main ) {
			this.elements.main.addEventListener( 'animationend', this.removeEntranceAnimationClasses.bind( this, this.elements.main, mainEntranceAnimation ) );
			window.addEventListener( 'keyup', this.onDocumentKeyup.bind( this ) );
		}
	}

	closeFloatingBar() {
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

	moveFloatingBarsBasedOnPosition() {
		// const floatingBars = document.querySelectorAll( '[data-widget_type^="floating-bars"]' );

		// floatingBars.forEach( ( element ) => {
		// 	const floatingBar = element.querySelector( '.e-floating-bars' );

		// 	if ( floatingBar.classList.contains( 'has-vertical-position-top' ) && ! floatingBar.classList.contains( 'is-sticky' ) ) {
		// 		const elementToInsert = elementorFrontend.isEditMode() ? element.closest( '[data-element_type="container"]' ) : element;

		// 		document.body.insertBefore( elementToInsert, document.body.querySelector( 'header' ) );
		// 	}
		// } );
	}

	onDocumentKeyup( event ) {
		// Bail if not ESC key
		if ( event.keyCode !== 27 || ! this.elements.main ) {
			return;
		}

		/* eslint-disable @wordpress/no-global-active-element */
		if ( this.elements.main.contains( document.activeElement ) ) {
			this.closeFloatingBar();
		}
		/* eslint-enable @wordpress/no-global-active-element */
	}

	initDefaultState() {
		// Focus on load
		if ( this.elements.main && ! elementorFrontend.isEditMode() ) {
			this.elements.main.setAttribute( 'tabindex', '0' );
			this.elements.main.focus( { focusVisible: true } );
		}
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

		this.moveFloatingBarsBasedOnPosition();

		this.initDefaultState();
	}
}
