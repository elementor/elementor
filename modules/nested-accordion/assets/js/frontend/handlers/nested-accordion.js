import Base from '../../../../../../assets/dev/js/frontend/handlers/base';

export default class NestedAccordion extends Base {
	/**
	 * @param {string|number} tabIndex
	 *
	 * @return {string}
	 */
	getTabTitleFilterSelector( tabIndex ) {
		return `[data-tab="${ tabIndex }"]`;
	}

	/**
	 * @param {string|number} tabIndex
	 *
	 * @return {string}
	 */
	getTabContentFilterSelector( tabIndex ) {
		// Double by 2, since each `e-con`.
		return `*:nth-child(${ tabIndex * 2 })`;
	}

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
			const settings = this.getSettings(),
				$titles = this.findElement( '.e-n-accordion details' );
			let index = 0;

			this.findElement( '.e-n-accordion > .e-con' ).each( function () {
				$titles[ index ].appendChild(this);
				index++;
			} );
		}
	}
}
