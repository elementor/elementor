export class FlyoutInteractionHandler {
	constructor() {
		this.activeFlyout = null;
		this.init();
	}

	init() {
		this.bindEvents();
	}

	bindEvents() {
		document.addEventListener( 'mouseenter', this.handleMouseEnter.bind( this ), true );
		document.addEventListener( 'mouseleave', this.handleMouseLeave.bind( this ), true );
		document.addEventListener( 'click', this.handleClick.bind( this ) );
	}

	handleMouseEnter( event ) {
		const flyoutContainer = event.target.closest( '.e-flyout-menu-container' );
		const parentMenuItem = event.target.closest( 'li' );

		if ( parentMenuItem && parentMenuItem.querySelector( '.e-flyout-menu-container' ) ) {
			this.showFlyout( parentMenuItem );
		} else if ( flyoutContainer ) {
			const parent = flyoutContainer.closest( 'li' );
			if ( parent ) {
				this.showFlyout( parent );
			}
		}
	}

	handleMouseLeave( event ) {
		const flyoutContainer = event.target.closest( '.e-flyout-menu-container' );
		const parentMenuItem = event.target.closest( 'li' );

		if ( flyoutContainer || parentMenuItem ) {
			const relatedTarget = event.relatedTarget;

			if ( ! relatedTarget || ( ! relatedTarget.closest( '.e-flyout-menu-container' ) && ! relatedTarget.closest( 'li' ) ) ) {
				this.hideFlyout();
			}
		}
	}

	handleClick( event ) {
		const flyoutLink = event.target.closest( '.e-flyout-menu-link' );

		if ( flyoutLink ) {
			this.hideFlyout();
		}
	}

	showFlyout( element ) {
		this.hideFlyout();

		const flyoutContainer = element.querySelector( '.e-flyout-menu-container' );

		if ( ! flyoutContainer ) {
			return;
		}

		flyoutContainer.classList.add( 'e-flyout-active' );
		element.classList.add( 'e-flyout-parent-active' );
		this.activeFlyout = flyoutContainer;

		this.positionFlyout( flyoutContainer, element );
	}

	hideFlyout() {
		if ( this.activeFlyout ) {
			this.activeFlyout.classList.remove( 'e-flyout-active' );
			const parent = this.activeFlyout.closest( 'li' );

			if ( parent ) {
				parent.classList.remove( 'e-flyout-parent-active' );
			}

			this.activeFlyout = null;
		}
	}

	positionFlyout( flyoutContainer, parentElement ) {
		const flyoutContent = flyoutContainer.querySelector( '.e-flyout-menu-content' );

		if ( ! flyoutContent ) {
			return;
		}

		const rect = parentElement.getBoundingClientRect();
		const flyoutRect = flyoutContent.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let top = 0;
		let left = rect.width;

		if ( rect.left + rect.width + flyoutRect.width > viewportWidth ) {
			left = -flyoutRect.width;
		}

		if ( rect.top + flyoutRect.height > viewportHeight ) {
			top = viewportHeight - rect.top - flyoutRect.height;
		}

		if ( rect.top + top < 0 ) {
			top = -rect.top;
		}

		flyoutContent.style.top = `${ top }px`;
		flyoutContent.style.left = `${ left }px`;
	}
}

