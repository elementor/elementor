import Base from 'elementor/assets/dev/js/frontend/handlers/base';

export default class NestedAccordion extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				accordionContentContainers: '.e-n-accordion > .e-con',
				accordionItems: '.e-n-accordion-item',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$contentContainers: this.findElement( selectors.accordionContentContainers ),
			$items: this.findElement( selectors.accordionItems ),
		};
	}

	onInit( ...args ) {
		super.onInit( ...args );

		if ( elementorFrontend.isEditMode() ) {
			this.interlaceContainers();
		}

		this.applyDefaultStateCondition();
	}

	interlaceContainers() {
		const { $contentContainers, $items } = this.getDefaultElements();

		$contentContainers.each( ( index, element ) => {
			$items[ index ].appendChild( element );
		} );
	}

	applyDefaultStateCondition() {
		if ( ! this.elements ) {
			return;
		}

		const accordionItems = this.elements.$items,
			defaultState = this.getDefaultStateCondition(),
			stateFirstExpanded = 'first_expended';

		if ( stateFirstExpanded === defaultState ) {
			accordionItems[ 0 ].setAttribute( 'open', '' );
		} else {
			accordionItems.each( ( _, item ) => item.removeAttribute( 'open' ) );
		}
	}

	getDefaultStateCondition() {
		return elementorFrontend.utils.controls.getControlValue( this.getElementSettings(), 'default_state', '' );
	}

	bindEvents() {
		elementorFrontend.elements.$window.on( 'resize', this.applyDefaultStateCondition.bind( this ) );
		this.bindAnimationListeners();
	}

	unbindEvents() {
		elementorFrontend.elements.$window.off( 'resize' );
		this.removeAnimationListeners();
	}

	bindAnimationListeners() {
		const { $items } = this.getDefaultElements();

		$items.each( ( _, element ) => {
			element.addEventListener( 'click', ( e ) => {
				if ( element.hasAttribute( 'open' ) ) {
					e.preventDefault();
					element.classList.add( 'closing' );
				}
			} );

			element.addEventListener( 'animationend', ( e ) => {
				if ( 'close' === e.animationName ) {
					element.removeAttribute( 'open' );
					element.classList.remove( 'closing' );
				}
			} );
		} );
	}

	removeAnimationListeners() {
		const { $items } = this.getDefaultElements();

		$items.each( ( _, element ) => {
			element.removeEventListener( 'click', ( e ) => {
				if ( element.hasAttribute( 'open' ) ) {
					e.preventDefault();
					element.classList.add( 'closing' );
				}
			} );

			element.removeEventListener( 'animationend', ( e ) => {
				if ( 'close' === e.animationName ) {
					element.removeAttribute( 'open' );
					element.classList.remove( 'closing' );
				}
			} );
		} );
	}
}
