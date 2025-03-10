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
				hasVerticalPositionBottom: 'has-vertical-position-bottom',
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

	onElementChange( property ) {
		const changedProperties = [
			'advanced_vertical_position',
		];

		if ( changedProperties.includes( property ) ) {
			this.initDefaultState();
		}
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

		if ( this.hasStickyElements() ) {
			window.addEventListener( 'resize', this.handleStickyElements.bind( this ) );
		}
	}

	isStickyTop() {
		const { isSticky, hasVerticalPositionTop } = this.getSettings( 'constants' );

		return this.elements.main.classList.contains( isSticky ) && this.elements.main.classList.contains( hasVerticalPositionTop );
	}

	isStickyBottom() {
		const { isSticky, hasVerticalPositionBottom } = this.getSettings( 'constants' );

		return this.elements.main.classList.contains( isSticky ) && this.elements.main.classList.contains( hasVerticalPositionBottom );
	}

	hasStickyElements() {
		const stickyElements = document.querySelectorAll( '.elementor-sticky' );

		return stickyElements.length > 0;
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

	handleStickyElements() {
		const mainHeight = this.elements.main.offsetHeight;
		const wpAdminBar = elementorFrontend.elements.$wpAdminBar;
		const stickyElements = document.querySelectorAll( '.elementor-sticky:not(.elementor-sticky__spacer)' );

		if ( 0 === stickyElements.length ) {
			return;
		}

		stickyElements.forEach( ( stickyElement ) => {
			const dataSettings = stickyElement.getAttribute( 'data-settings' );
			const stickyPosition = JSON.parse( dataSettings )?.sticky;

			const isTop = '0px' === stickyElement.style.top || 'top' === stickyPosition;
			const isBottom = '0px' === stickyElement.style.bottom || 'bottom' === stickyPosition;

			if ( this.isStickyTop() && isTop ) {
				if ( wpAdminBar.length ) {
					stickyElement.style.top = `${ mainHeight + wpAdminBar.height() }px`;
				} else {
					stickyElement.style.top = `${ mainHeight }px`;
				}
			} else if ( this.isStickyBottom() && isBottom ) {
				stickyElement.style.bottom = `${ mainHeight }px`;
			}

			if ( elementorFrontend.isEditMode() ) {
				if ( isTop ) {
					stickyElement.style.top = this.isStickyTop() ? `${ mainHeight }px` : '0px';
				} else if ( isBottom ) {
					stickyElement.style.bottom = this.isStickyBottom() ? `${ mainHeight }px` : '0px';
				}
			}
		} );

		document.querySelectorAll( '.elementor-sticky__spacer' ).forEach( ( stickySpacer ) => {
			const dataSettings = stickySpacer.getAttribute( 'data-settings' );
			const stickyPosition = JSON.parse( dataSettings )?.sticky;

			const isTop = '0px' === stickySpacer.style.top || 'top' === stickyPosition;

			if ( this.isStickyTop() && isTop ) {
				stickySpacer.style.marginBottom = `${ mainHeight }px`;
			}
		} );
	}

	closeFloatingBar() {
		const { isHidden } = this.getSettings( 'constants' );

		if ( ! elementorFrontend.isEditMode() ) {
			this.elements.main.classList.add( isHidden );

			if ( this.hasStickyElements() ) {
				this.handleStickyElements();
			} else if ( this.isStickyTop() ) {
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
			this.handleWPAdminBar();
		}

		if ( this.hasStickyElements() ) {
			this.handleStickyElements();
		} else if ( this.isStickyTop() ) {
			this.applyBodyPadding();
		}

		if ( this.elements.main && ! this.elements.ctaButton.classList.contains( hasEntranceAnimation ) && ! elementorFrontend.isEditMode() ) {
			this.focusOnLoad();
		}
	}

	setupInnerContainer() {
		this.elements.main.closest( '.e-con-inner' ).classList.add( 'e-con-inner--floating-bars' );
		this.elements.main.closest( '.e-con' ).classList.add( 'e-con--floating-bars' );
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

		this.setupInnerContainer();
	}
}
