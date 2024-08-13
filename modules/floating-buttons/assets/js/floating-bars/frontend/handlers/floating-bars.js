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
				hasEntranceAnimation: 'has-entrance-animation',
				visible: 'visible',
				isSticky: 'is-sticky',
				hasVerticalPositionTop: 'has-vertical-position-top',
				isHidden: 'is-hidden',
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
		const { ctaEntranceAnimation } = this.getSettings( 'constants' );

		if ( this.elements.closeButton ) {
			this.elements.closeButton.addEventListener( 'click', this.closeFloatingBar.bind( this ) );
		}

		if ( this.elements.ctaButton ) {
			this.elements.ctaButton.addEventListener( 'animationend', this.handleAnimationEnd.bind( this, this.elements.ctaButton, ctaEntranceAnimation ) );
		}

		if ( this.elements.main ) {
			window.addEventListener( 'keyup', this.onDocumentKeyup.bind( this ) );
		}
	}

	isStickyTop() {
		const { isSticky, hasVerticalPositionTop } = this.getSettings( 'constants' );

		return this.elements.main.classList.contains( isSticky ) && this.elements.main.classList.contains( hasVerticalPositionTop );
	}

	focusOnLoad() {
		this.elements.main.setAttribute( 'tabindex', '0' );
		this.elements.main.focus( { focusVisible: true } );
	}

	applyBodyPadding() {
		const mainHeight = this.elements.main.offsetHeight;
		document.body.style.paddingTop = `${ mainHeight }px`;
	}

	removeBodyPadding() {
		document.body.style.paddingTop = '0';
	}

	handleWPAdminBar() {
		const wpAdminBar = elementorFrontend.elements.$wpAdminBar;

		if ( wpAdminBar.length ) {
			this.elements.main.style.top = `${ wpAdminBar.height() }px`;
		}
	}

	closeFloatingBar() {
		const { isHidden } = this.getSettings( 'constants' );

		if ( ! elementorFrontend.isEditMode() ) {
			this.elements.main.classList.add( isHidden );

			if ( this.isStickyTop() ) {
				this.removeBodyPadding();
			}
		}
	}

	initEntranceAnimation( element, animation ) {
		const { none } = this.getSettings( 'constants' );

		const entranceAnimationControl = this.getResponsiveSetting( animation );

		if ( ! entranceAnimationControl || none === entranceAnimationControl ) {
			return;
		}

		element.classList.add( entranceAnimationControl );
	}

	handleAnimationEnd( element, animation ) {
		this.removeEntranceAnimationClasses( element, animation );
		this.focusOnLoad();
	}

	removeEntranceAnimationClasses( element, animation ) {
		if ( ! element ) {
			return;
		}

		const { visible } = this.getSettings( 'constants' );

		element.classList.remove( animation );
		element.classList.add( visible );
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
		const { hasEntranceAnimation } = this.getSettings( 'constants' );

		if ( this.isStickyTop() ) {
			this.applyBodyPadding();
			this.handleWPAdminBar();
		}

		if ( this.elements.main && ! this.elements.ctaButton.classList.contains( hasEntranceAnimation ) && ! elementorFrontend.isEditMode() ) {
			this.focusOnLoad();
		}
	}

	moveFloatingBarsBasedOnPosition() {
		const el = this.$element[ 0 ];
		const $widget = el.querySelector( '.e-floating-bars' );

		if (
			el.dataset.widget_type.startsWith( 'floating-bars' ) &&
			$widget.classList.contains( 'has-vertical-position-top' ) &&
			! $widget.classList.contains( 'is-sticky' )
		) {
			const elementToInsert = elementorFrontend.isEditMode() ? el.closest( '[data-element_type="container"]' ) : el;
			const wpAdminBar = document.getElementById( 'wpadminbar' );

			if ( wpAdminBar ) {
				wpAdminBar.after( elementToInsert );
			} else {
				document.body.prepend( elementToInsert );
			}
		}
	}

	onInit( ...args ) {
		const { hasEntranceAnimation, ctaEntranceAnimation } = this.getSettings( 'constants' );

		super.onInit( ...args );

		this.moveFloatingBarsBasedOnPosition();

		if ( this.elements.ctaButton && this.elements.ctaButton.classList.contains( hasEntranceAnimation ) ) {
			this.initEntranceAnimation( this.elements.ctaButton, ctaEntranceAnimation );
		}

		this.initDefaultState();
	}
}
