import Base from 'elementor-frontend/handlers/base';

export default class FloatingBarsHandler extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				main: '.e-floating-bars',
				closeButton: '.e-floating-bars__close-button',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getDefaultSettings( 'selectors' );
		return {
			main: this.$element[ 0 ].querySelector( selectors.main ),
			closeButton: this.$element[ 0 ].querySelector( selectors.closeButton ),
		};
	}

	onCloseButtonClick() {
		this.elements.main.classList.add( 'is-hidden' );
	}

	bindEvents() {
		if ( this.elements.closeButton ) {
			this.elements.closeButton.addEventListener( 'click', this.onCloseButtonClick.bind( this ) );
		}
	}

	onInit( ...args ) {
		super.onInit( ...args );
	}
}
