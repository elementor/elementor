const Widget = require( '../widgets/base-widget' );
const Control = require( '../controls/base-control' );

module.exports = class EditorPage {
	/**
	 * @type {import('@playwright/test').Page}
	 */
	page;

	/**
	 * @type {number}
	 */
	pageId;

	/**
	 * @param {import('@playwright/test').Page} page
	 * @param {number}                          pageId
	 */
	constructor( page, pageId ) {
		this.page = page;
		this.pageId = pageId;
	}

	/**
	 * @return {Frame}
	 */
	getPreviewFrame() {
		return this.page.frame( { name: 'elementor-preview-iframe' } );
	}

	/**
	 * @return {Promise<void>}
	 */
	async ensureLoaded() {
		await Promise.all( [
			this.page.waitForSelector( '.elementor-panel-loading', { state: 'detached' } ),
			this.page.waitForSelector( '#elementor-loading', { state: 'hidden' } ),
		] );
	}

	/**
	 * @return {Promise<void>}
	 */
	async ensureNavigatorClosed() {
		const navigatorCloseButton = await this.page.$( '#elementor-navigator__close' );

		if ( navigatorCloseButton ) {
			await navigatorCloseButton.click();
		}
	}

	/**
	 * @param {Widget} widget
	 * @return {Promise<number>}
	 */
	async addWidget( widget ) {
		const elementId = await this.page.evaluate( async ( { model } ) => {
			const section = $e.run(
				'document/elements/create',
				{
					model: { elType: 'section' },
					columns: 1,
					container: window.elementor.getContainer( 'document' ),
				},
			);

			const element = $e.run( 'document/elements/create', { model, container: section.children[ 0 ] } );

			return element.id;
		}, {
			model: {
				widgetType: widget.type,
				elType: 'widget',
			},
		} );

		await this.getPreviewFrame().waitForSelector( widget.getPreviewSelector( elementId ) );

		return elementId;
	}

	/**
	 * @return {Promise<void>}
	 */
	async savePage() {
		await this.page.locator( 'button:has-text("Publish"), button:has-text("Update")' ).click();

		await this.page.waitForSelector( 'button.elementor-disabled:has-text("Update")' );
	}

	/**
	 * @param {Control} control
	 * @param {string}  value
	 * @return {Promise<void>}
	 */
	async setControlValue( control, value ) {
		await this.openControlTab( control.tab );
		await this.openControlSection( control.section );

		// Open popover.
		if ( control.isInsidePopover ) {
			await this.toggleControlPopover( control.getSelector(), true );
		}

		if ( value === control.defaultValue ) {
			await control.resetValue(
				await this.page.locator( control.getSelector() ),
			);
		} else {
			await control.setValue(
				await this.page.locator( control.getSelector() ),
				value,
			);
		}

		// Close popover.
		if ( control.isInsidePopover ) {
			await this.toggleControlPopover( control.getSelector(), false );
		}
	}

	async openControlTab( tabName ) {
		await this.page.locator( `.elementor-panel-navigation-tab[data-tab="${ tabName }"]` ).click();
	}

	async openControlSection( sectionName ) {
		const section = await this.page.$( `.elementor-control-${ sectionName }:not( .elementor-open )` );

		if ( section ) {
			await section.click();
		}
	}

	async toggleControlPopover( controlSelector, shouldOpen ) {
		const popover = await this.page.$( `.elementor-controls-popover`, {
			has: await this.page.locator( controlSelector ),
		} );

		const isOpen = await popover.evaluate( ( node ) => 'block' === node.style.display );

		if (
			( ! isOpen && shouldOpen ) ||
			( isOpen && ! shouldOpen )
		) {
			const toggleButtonId = await popover.evaluate( ( node ) => node.dataset.popoverToggle );

			await this.page.click(
				`label.elementor-control-popover-toggle-toggle-label[for=/${ toggleButtonId }-*/]`,
			);
		}
	}
};
