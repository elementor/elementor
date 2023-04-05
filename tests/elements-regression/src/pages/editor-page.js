export default class EditorPage {
	page;
	container;

	constructor( page ) {
		this.page = page;
		this.container = this.page.locator( '[data-element_type="container"]' );
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
	 * @return {Promise<void>}
	 */
	async ensureNoticeBarClosed() {
		const noticeBarCloseButton = await this.page.$( '#e-notice-bar__close' );

		if ( noticeBarCloseButton ) {
			await noticeBarCloseButton.click();
		}
	}

	/**
	 * Add element to the page using a model.
	 *
	 * @param {Object} model     - Model definition.
	 * @param {string} container - Optional Container to create the element in.
	 *
	 * @return {Promise<*>} Element ID
	 */
	async addElement( model, container = null ) {
		return await this.page.evaluate( async ( args ) => {
			let parent;

			if ( args.container ) {
				parent = elementor.getContainer( args.container );
			} else {
				// If a `container` isn't supplied - create a new Section.
				const section = $e.run(
					'document/elements/create',
					{
						model: { elType: 'section' },
						columns: 1,
						container: elementor.getContainer( 'document' ),
					},
				);

				parent = section.children[ 0 ];
			}

			const element = $e.run(
				'document/elements/create',
				{
					model: args.model,
					container: parent,
				},
			);

			return element.id;
		}, { model, container } );
	}

	/**
	 * Add a widget by `widgetType`.
	 *
	 * @param {string} widgetType
	 * @param {string} container  - Optional Container to create the element in.
	 */
	async addWidget( widgetType, container = null ) {
		return await this.addElement( { widgetType, elType: 'widget' }, container );
	}

	/**
	 * @return {import('@playwright/test').Frame}
	 */
	getPreviewFrame() {
		return this.page.frame( { name: 'elementor-preview-iframe' } );
	}

	getPreviewElement( id ) {
		return this.getPreviewFrame().locator( `.elementor-element-${ id }` );
	}

	/**
	 * @param {string} id
	 * @return {Promise<void>}
	 */
	async resetElementSettings( id ) {
		await this.page.evaluate( ( { elementId } ) => {
			$e.run( 'document/elements/reset-settings', {
				container: window.elementor.getContainer( elementId ),
				options: {
					external: true,
				},
			} );
		}, { elementId: id } );
	}

	async waitForElementRender( id ) {
		let isLoading;

		try {
			await this.getPreviewFrame().waitForSelector(
				`.elementor-element-${ id }.elementor-loading`,
				{ timeout: 500 },
			);

			isLoading = true;
		} catch ( e ) {
			isLoading = false;
		}

		if ( isLoading ) {
			await this.getPreviewFrame().waitForSelector(
				`.elementor-element-${ id }.elementor-loading`,
				{ state: 'detached' },
			);

			await this.page.waitForTimeout( 400 );
		}
	}

	async publishAndViewPage() {
		await this.page.locator( 'button#elementor-panel-saver-button-publish' ).click();
		await this.page.waitForLoadState();
		await Promise.all( [
			this.page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			this.page.locator( '#elementor-panel-header-menu-button i' ).click(),
		] );

		await this.page.locator( '.elementor-panel-menu-item-view-page > a' ).click();
		await this.page.waitForLoadState();
	}

	async setupElementorPage( wpAdminPage ) {
		await this.ensureLoaded();
		await this.ensureNavigatorClosed();
		await this.ensureNoticeBarClosed();
		await wpAdminPage.createElementorPage();
		await this.ensureLoaded();
		await this.ensureNavigatorClosed();
		await this.ensureNoticeBarClosed();
	}

	async loadTemplate( filePath ) {
		const templateData = require( filePath );

		await this.page.evaluate( ( data ) => {
			const model = new Backbone.Model( { title: 'test' } );

			window.$e.run( 'document/elements/import', {
				data,
				model,
				options: {
					at: 0,
					withPageSettings: false,
				},
			} );
		}, templateData );
	}

	async setElementorEditorPanel( state ) {
		await this.page.getByTitle( state ).click();
	}

	async getWidgetCount() {
		return ( await this.getPreviewFrame().$$( '[data-element_type="widget"]' ) ).length;
	}

	getWidget() {
		return this.getPreviewFrame().locator( '[data-element_type="widget"]' );
	}
}
