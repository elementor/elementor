import Base from 'elementor-frontend/handlers/base';
import FloatingBarDomHelper from '../classes/floatin-bar-dom';
import ClickTrackingHandler from '../../../shared/frontend/handlers/click-tracking';

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
				ctaEntranceAnimationDelay: 'style_cta_button_animation_delay',
				hasEntranceAnimation: 'has-entrance-animation',
				visible: 'visible',
				isSticky: 'is-sticky',
				hasVerticalPositionTop: 'has-vertical-position-top',
				isHidden: 'is-hidden',
				animated: 'animated',
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
		if ( this.elements.closeButton ) {
			this.elements.closeButton.addEventListener( 'click', this.closeFloatingBar.bind( this ) );
		}

		if ( this.elements.ctaButton ) {
			this.elements.ctaButton.addEventListener( 'animationend', this.handleAnimationEnd.bind( this ) );
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

	initEntranceAnimation() {
		const { animated, ctaEntranceAnimation, ctaEntranceAnimationDelay, hasEntranceAnimation } = this.getSettings( 'constants' );
		const entranceAnimationClass = this.getResponsiveSetting( ctaEntranceAnimation );
		const entranceAnimationDelay = this.getResponsiveSetting( ctaEntranceAnimationDelay ) || 0;
		const setTimeoutDelay = entranceAnimationDelay + 500;

		this.elements.ctaButton.classList.add( animated );
		this.elements.ctaButton.classList.add( entranceAnimationClass );

		setTimeout( () => {
			this.elements.ctaButton.classList.remove( hasEntranceAnimation );
		}, setTimeoutDelay );
	}

	handleAnimationEnd() {
		this.removeEntranceAnimationClasses();
		this.focusOnLoad();
	}

	removeEntranceAnimationClasses() {
		if ( ! this.elements.ctaButton ) {
			return;
		}
		const { animated, ctaEntranceAnimation, visible } = this.getSettings( 'constants' );
		const entranceAnimationClass = this.getResponsiveSetting( ctaEntranceAnimation );

		this.elements.ctaButton.classList.remove( animated );
		this.elements.ctaButton.classList.remove( entranceAnimationClass );
		this.elements.ctaButton.classList.add( visible );
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

	onInit( ...args ) {
		const { hasEntranceAnimation } = this.getSettings( 'constants' );

		super.onInit( ...args );

		this.clickTrackingHandler = new ClickTrackingHandler( { $element: this.$element } );

		const domHelper = new FloatingBarDomHelper( this.$element );
		domHelper.maybeMoveToTop();

		if ( this.elements.ctaButton && this.elements.ctaButton.classList.contains( hasEntranceAnimation ) ) {
			this.initEntranceAnimation();
		}

		this.initDefaultState();
	}
}
