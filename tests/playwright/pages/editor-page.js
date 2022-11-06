const { addElement, getElementSelector } = require( '../assets/elements-utils' );
const BasePage = require( './base-page.js' );

module.exports = class EditorPage extends BasePage {
	isPanelLoaded = false;

	constructor( page, testInfo, cleanPostId = null ) {
		super( page, testInfo );

		this.previewFrame = this.page.frame( { name: 'elementor-preview-iframe' } );

		this.postId = cleanPostId;
	}

	async openNavigator() {
		const isOpen = await this.previewFrame.evaluate( () =>
			elementor.navigator.isOpen(),
		);

		if ( ! isOpen ) {
			await this.page.click( '#elementor-panel-footer-navigator' );
		}
	}

	/**
	 * Close the navigator if open.
	 *
	 * @return {Promise<void>}
	 */
	async closeNavigatorIfOpen() {
		const isOpen = await this.previewFrame.evaluate( () => elementor.navigator.isOpen() );

		if ( isOpen ) {
			await this.page.click( '#elementor-navigator__close' );
		}
	}

	/**
	 * Reload the editor page.
	 *
	 * @return {Promise<void>}
	 */
	async reload() {
		await this.page.reload();

		this.previewFrame = this.page.frame( { name: 'elementor-preview-iframe' } );
	}

    getFrame() {
		return this.page.frame( { name: 'elementor-preview-iframe' } );
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

		this.isPanelLoaded = true;
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
		return await this.page.evaluate( addElement, { model, container } );
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
	 * @typedef {import('@playwright/test').ElementHandle} ElementHandle
	 */
	/**
	 * Get element handle from the preview frame using its Container ID.
	 *
	 * @param {string} id - Container ID.
	 *
	 * @return {Promise<ElementHandle<SVGElement | HTMLElement> | null>} element handle
	 */
	async getElementHandle( id ) {
		return this.getPreviewFrame().$( getElementSelector( id ) );
	}

	getPreviewFrame() {
		return this.page.frame( { name: 'elementor-preview-iframe' } );
	}

	/**
	 * Use the Canvas post template.
	 *
	 * @return {Promise<void>}
	 */
	async useCanvasTemplate() {
		await this.page.click( '#elementor-panel-footer-settings' );
		await this.page.selectOption( '.elementor-control-template >> select', 'elementor_canvas' );
		await this.getPreviewFrame().waitForSelector( '.elementor-template-canvas' );
	}

	/**
	 * Select an element inside the editor.
	 *
	 * @param {string} elementId - Element ID;
	 *
	 * @return {Promise<void>}
	 */
	async selectElement( elementId ) {
		const element = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId );
		await element.hover();
		const elementEditButton = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId + ' > .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-edit' );
		await elementEditButton.click();
	}

	/**
	 * Activate a tab inside the panel editor.
	 *
	 * @param {string} panelName - The name of the panel;
	 *
	 * @return {Promise<void>}
	 */
	async activatePanelTab( panelName ) {
		await this.page.waitForSelector( '.elementor-tab-control-' + panelName + ' a' );
		await this.page.locator( '.elementor-tab-control-' + panelName + ' a' ).click();
		await this.page.waitForSelector( '.elementor-tab-control-' + panelName + '.elementor-active' );
	}

	/**
	 * Set a custom width value to a widget.
	 *
	 * @param {string} width - The custom width value (as a percentage);
	 *
	 * @return {Promise<void>}
	 */
	async setWidgetCustomWidth( width = '100' ) {
		await this.activatePanelTab( 'advanced' );
		await this.page.selectOption( '.elementor-control-_element_width >> select', 'initial' );
		await this.page.locator( '.elementor-control-_element_custom_width .elementor-control-input-wrapper input' ).fill( width );
	}

	/**
	 * Set a widget to `flew grow`.
	 *
	 * @return {Promise<void>}
	 */
	async setWidgetToFlexGrow() {
		await this.page.locator( '.elementor-control-_flex_size .elementor-control-input-wrapper .eicon-grow' ).click();
	}

	/**
	 * Set a widget mask.
	 *
	 * @return {Promise<void>}
	 */
	async setWidgetMask() {
		await this.page.locator( '.elementor-control-_section_masking' ).click();
		await this.page.locator( '.elementor-control-_mask_switch .elementor-control-input-wrapper .elementor-switch .elementor-switch-label' ).click();
		await this.page.selectOption( '.elementor-control-_mask_size >> select', 'custom' );
		await this.page.locator( '.elementor-control-_mask_size_scale .elementor-control-input-wrapper input' ).fill( '30' );
		await this.page.selectOption( '.elementor-control-_mask_position >> select', 'top right' );
	}

	/**
	 * Autopopulate the Image Carousel.
	 *
	 * @return {Promise<void>}
	 */
	async populateImageCarousel() {
		await this.page.locator( '[aria-label="Add Images"]' ).click();

		// Open Media Library
		await this.page.click( 'text=Media Library' );

		// Upload the images to WP media library
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/A.jpg' );
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/B.jpg' );
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/C.jpg' );
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/D.jpg' );
		await this.page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/E.jpg' );

		// Create a new gallery
		await this.page.locator( 'text=Create a new gallery' ).click();

		// Insert gallery
		await this.page.locator( 'text=Insert gallery' ).click();

		// Open The Additional options Section
		await this.page.click( '#elementor-controls >> :nth-match(div:has-text("Additional Options"), 3)' );

		// Disable AutoPlay
		await this.page.selectOption( 'select', 'no' );
	}

	/**
	 * Set a background color to an element.
	 *
	 * @param {string} color       - The background color code;
	 * @param {string} elementType - The element types are `widget` and `container`;
	 *
	 * @return {Promise<void>}
	 */
	async setBackgroundColor( color = '#A81830', elementType = 'widget' ) {
		const panelTab = 'container' === elementType ? 'style' : 'advanced',
			backgroundSelector = 'container' === elementType ? '.elementor-control-background_background ' : '.elementor-control-_background_background ',
			backgroundColorSelector = 'container' === elementType ? '.elementor-control-background_color ' : '.elementor-control-_background_color ';

		await this.activatePanelTab( panelTab );

		if ( 'widget' === elementType ) {
			await this.page.locator( '.elementor-control-_section_background .elementor-panel-heading-title' ).click();
		}

		await this.page.locator( backgroundSelector + '.eicon-paint-brush' ).click();
		await this.page.locator( backgroundColorSelector + '.pcr-button' ).click();
		await this.page.locator( '.pcr-app.visible .pcr-interaction input.pcr-result' ).fill( color );
	}

	/**
	 * Remove the focus from the test elements by creating two new elements.
	 *
	 * @return {Promise<void>}
	 */
	async removeFocus() {
		await this.getPreviewFrame().locator( '#elementor-add-new-section' ).click( { button: 'right' } );
	}

	async changeUiTheme( uiMode ) {
		await this.page.locator( '#elementor-panel-header-menu-button' ).click();
		await this.page.click( '.elementor-panel-menu-item-editor-preferences' );
		await this.page.selectOption( '.elementor-control-ui_theme  select', uiMode );
	}
};

