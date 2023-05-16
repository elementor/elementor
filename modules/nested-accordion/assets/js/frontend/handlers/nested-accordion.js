import Base from '../../../../../../assets/dev/js/frontend/handlers/base';

export default class NestedAccordion extends Base {
	getDefaultSettings() {
		return {
			selectors: {},
			classes: {
				active: 'e-active',
			},
		};
	}

	onInit( ...args ) {
		super.onInit( ...args );

		this.interlaceContainers();
	}

	interlaceContainers() {
		if ( elementorFrontend.isEditMode() ) {
			const $titles = this.findElement( '.e-n-accordion details' );
			let index = 0;

			this.findElement( '.e-n-accordion > .e-con' ).each( function () {
				$titles[ index ].appendChild(this);
				index++;
			} );
		}
	}
}
