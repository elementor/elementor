import Base from 'elementor/assets/dev/js/frontend/handlers/base';

export default class NestedAccordion extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				accordionContentContainers: '.e-n-accordion > .e-con',
				accordionItems: '.e-n-accordion-item',
			},
			default_state: 'first_expended',
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
			{ default_state: currentState } = this.getElementSettings(),
			{ default_state: defaultState } = this.getDefaultSettings();

		if ( currentState === defaultState ) {
			accordionItems[ 0 ].setAttribute( 'open', '' );
		} else {
			accordionItems.each( ( _, item ) => item.removeAttribute( 'open' ) );
		}
	}

	bindEvents() {
		this.bindAnimationListeners();
	}

	unbindEvents() {
		this.removeAnimationListeners();
	}

	bindAnimationListeners() {
		const { $items } = this.getDefaultElements();

		$items.each( ( _, element ) => {
			element.addEventListener( 'click', ( e ) => {
				this.applyAnimationClasses( e, element );
			} );

			element.addEventListener( 'animationend', ( e ) => {
				this.removeAnimationClasses( e, element );
			} );
		} );
	}

	applyAnimationClasses( e, element ) {
		if ( element.hasAttribute( 'open' ) ) {
			e.preventDefault();
			element.classList.add( 'closing' );
		}
	}

	removeAnimationClasses( e, element ) {
		if ( 'close' === e.animationName ) {
			element.removeAttribute( 'open' );
			element.classList.remove( 'closing' );
		}
	}

	removeAnimationListeners() {
		const { $items } = this.getDefaultElements();

		$items.each( ( _, element ) => {
			element.removeEventListener( 'click' );

			element.removeEventListener( 'animationend' );
		} );
	}
}
