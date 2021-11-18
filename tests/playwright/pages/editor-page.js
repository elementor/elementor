const { addElement, getElementSelector } = require( '../assets/elements-utils' );

exports.EditorPage = class EditorPage {
	panelLoaded = false;

	/**
	 * @param {import('@playwright/test').Page} page
	 */
	constructor( page ) {
		this.page = page;
		this.previewFrame = page.frame( { name: 'elementor-preview-iframe' } );
	}

	/**
	 * Make sure that the elements panel is loaded.
	 *
	 * @return {Promise<void>}
	 */
	async ensurePanelLoaded() {
		if ( this.panelLoaded ) {
			return;
		}

		await this.page.waitForSelector( '#elementor-panel-header-title' );
		await this.page.waitForSelector( 'iframe#elementor-preview-iframe' );
		await this.page.waitForTimeout( 5000 );

		this.panelLoaded = true;
	}

	/**
	 * Add element to the page using a model.
	 *
	 * @param {Object} model - Model definition.
	 * @param {string} container - Optional Container to create the element in.
	 *
	 * @return {Promise<*>}
	 */
	async addElement( model, container = null ) {
		await this.ensurePanelLoaded();

		return await this.page.evaluate( addElement, { model, container } );
	}

	/**
	 * Add a widget by `widgetType`.
	 *
	 * @shortcut `this.addElement()`
	 */
	async addWidget( widgetType, container = null ) {
		return await this.addElement( { widgetType, elType: 'widget' }, container );
	}

	/**
	 * Get element handle from the preview frame using its Container ID.
	 *
	 * @param {string} id - Container ID.
	 *
	 * @return {Promise<ElementHandle<SVGElement | HTMLElement> | null>}
	 */
	async getElementHandle( id ) {
		return this.previewFrame.$( getElementSelector( id ) );
	}
};
