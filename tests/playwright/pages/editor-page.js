const { addElement, getElementSelector } = require( '../assets/elements-utils' );
const { WpAdminPage } = require( './wp-admin-page' );

exports.EditorPage = class EditorPage {
	isPanelLoaded = false;

	/**
	 * @param {import('@playwright/test').Page} page
	 */
	constructor( page ) {
		this.page = page;
		this.previewFrame = page.frame( { name: 'elementor-preview-iframe' } );
	}

	/**
	 * Reload the editor page.
	 *
	 * @returns {Promise<void>}
	 */
	async reload() {
		await this.page.reload();
		this.previewFrame = this.page.frame( { name: 'elementor-preview-iframe' } );
	}

	/**
	 * Make sure that the elements panel is loaded.
	 *
	 * @return {Promise<void>}
	 */
	async ensurePanelLoaded() {
		if ( this.isPanelLoaded ) {
			return;
		}

		await this.page.waitForSelector( '#elementor-panel-header-title' );
		await this.page.waitForSelector( 'iframe#elementor-preview-iframe' );
		await this.page.waitForTimeout( 5000 );

		this.isPanelLoaded = true;
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

	async init( experiments ) {
		const wpAdmin = new WpAdminPage( this.page );

		if ( experiments ) {
			await wpAdmin.setExperiments( experiments );
		}

		await wpAdmin.createNewPage();

		await this.ensurePanelLoaded();

		this.previewFrame = this.page.frame( { name: 'elementor-preview-iframe' } );

		await this.page.waitForTimeout( 4000 );
	}
};
