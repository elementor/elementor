const { addElement, getElementSelector } = require( '../assets/elements-utils' );
const BasePage = require( './base-page.js' );

module.exports = class EditorPage extends BasePage {
	constructor( page, testInfo, cleanPostId = null ) {
		super( page, testInfo );

		this.previewFrame = this.getPreviewFrame();

		this.postId = cleanPostId;
	}

	async gotoPostId( id = this.postId ) {
		await this.page.goto( `wp-admin/post.php?post=${ id }&action=elementor` );

		await this.ensurePanelLoaded();
	}

	async loadTemplate( template ) {
		const templateData = require( `../templates/${ template }.json` );

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

	async cleanContent() {
		await this.page.evaluate( () => {
			$e.run( 'document/elements/empty', { force: true } );
		} );
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
		const isOpen = await this.getPreviewFrame().evaluate( () => elementor.navigator.isOpen() );

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

		this.previewFrame = this.getPreviewFrame();
	}

	/**
	 * Make sure that the elements panel is loaded.
	 *
	 * @return {Promise<void>}
	 */
	async ensurePanelLoaded() {
		await this.page.waitForSelector( '.elementor-panel-loading', { state: 'detached' } );
		await this.page.waitForSelector( '#elementor-loading', { state: 'hidden' } );
	}

	/**
	 * Add element to the page using a model.
	 *
	 * @param {Object}  model               - Model definition.
	 * @param {string}  container           - Optional Container to create the element in.
	 * @param {boolean} isContainerASection - Optional. Is the container a section.
	 *
	 * @return {Promise<*>} Element ID
	 */
	async addElement( model, container = null, isContainerASection = false ) {
		return await this.page.evaluate( addElement, { model, container, isContainerASection } );
	}

	/**
	 * Add a widget by `widgetType`.
	 *
	 * @param {string}  widgetType
	 * @param {string}  container           - Optional Container to create the element in.
	 * @param {boolean} isContainerASection - Optional. Is the container a section.
	 * @return {Promise<string>}			- widget ID
	 */
	async addWidget( widgetType, container = null, isContainerASection = false ) {
		const widgetId = await this.addElement( { widgetType, elType: 'widget' }, container, isContainerASection );
		await this.getPreviewFrame().waitForSelector( `[data-id='${ widgetId }']` );

		return widgetId;
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

	/**
	 * @return {import('@playwright/test').Frame|null}
	 */
	getPreviewFrame() {
		const previewFrame = this.page.frame( { name: 'elementor-preview-iframe' } );

		if ( ! this.previewFrame ) {
			this.previewFrame = previewFrame;
		}

		return previewFrame;
	}

	/**
	 * Use the Canvas post template.
	 *
	 * @return {Promise<void>}
	 */
	async useCanvasTemplate() {
		if ( await this.getPreviewFrame().$( '.elementor-template-canvas' ) ) {
			return;
		}

		await this.page.click( '#elementor-panel-footer-settings' );
		await this.page.selectOption( '.elementor-control-template >> select', 'elementor_canvas' );
		await this.getPreviewFrame().waitForSelector( '.elementor-template-canvas' );
	}

	/**
	 * Use the Default post template.
	 *
	 * @return {Promise<void>}
	 */
	async useDefaultTemplate() {
		if ( await this.getPreviewFrame().$( '.elementor-default' ) ) {
			return;
		}

		await this.page.click( '#elementor-panel-footer-settings' );
		await this.page.selectOption( '.elementor-control-template >> select', 'default' );
		await this.getPreviewFrame().waitForSelector( '.elementor-default' );
	}

	/**
	 * Select an element inside the editor.
	 *
	 * @param {string} elementId - Element ID;
	 *
	 * @return {Promise<void>}
	 */
	async selectElement( elementId ) {
		await this.getPreviewFrame().waitForSelector( '.elementor-element-' + elementId );

		if ( await this.getPreviewFrame().$( '.elementor-element-' + elementId + ':not( .elementor-sticky__spacer ).elementor-element-editable' ) ) {
			return;
		}

		const element = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId );
		await element.hover();
		const elementEditButton = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId + ' > .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-edit' );
		await elementEditButton.click();
		await this.getPreviewFrame().waitForSelector( '.elementor-element-' + elementId + ':not( .elementor-sticky__spacer ).elementor-element-editable' );
	}

	async copyElement( elementId ) {
		const element = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId );
		await element.click( { button: 'right' } );

		const copyListItemSelector = '.elementor-context-menu-list__item-copy:visible';
		await this.page.waitForSelector( copyListItemSelector );
		await this.page.locator( copyListItemSelector ).click();
	}

	async pasteStyleElement( elementId ) {
		const element = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId );
		await element.click( { button: 'right' } );

		const pasteListItemSelector = '.elementor-context-menu-list__item-pasteStyle:visible';
		await this.page.waitForSelector( pasteListItemSelector );
		await this.page.locator( pasteListItemSelector ).click();
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

		// Check if panel has been activated already.
		if ( await this.page.$( '.elementor-tab-control-' + panelName + '.elementor-active' ) ) {
			return;
		}

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
	 * Set a custom width value to a widget.
	 *
	 * @param {string}        controlId - The control to set the value to;
	 * @param {string|number} value     - The value to set;
	 *
	 * @return {Promise<void>}
	 */
	async setSliderControlValue( controlId, value ) {
		await this.page.locator( '.elementor-control-' + controlId + ' .elementor-slider-input input' ).fill( value.toString() );
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
		await this.activatePanelTab( 'content' );
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
	 * @param {string}  color     - The background color code;
	 * @param {string}  elementId - The ID of targeted element;
	 * @param {boolean} isWidget  - Indicate whether the element is a widget or not; the default value is 'widget';
	 *
	 * @return {Promise<void>}
	 */
	async setBackgroundColor( color, elementId, isWidget = true ) {
		const panelTab = isWidget ? 'advanced' : 'style',
			backgroundSelector = isWidget ? '.elementor-control-_background_background ' : '.elementor-control-background_background ',
			backgroundColorSelector = isWidget ? '.elementor-control-_background_color ' : '.elementor-control-background_color ';

		await this.selectElement( elementId );
		await this.activatePanelTab( panelTab );

		if ( isWidget ) {
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
		await this.getPreviewFrame().locator( '#elementor-add-new-section' ).click();
	}

	/**
	 * Hide controls from the video widgets.
	 *
	 * @return {Promise<void>}
	 */
	async hideVideoControls() {
		await this.getPreviewFrame().waitForSelector( '.elementor-video' );

		const videoFrame = this.getPreviewFrame().frameLocator( '.elementor-video' ),
			videoButton = videoFrame.locator( 'button.ytp-large-play-button.ytp-button.ytp-large-play-button-red-bg' ),
			videoGradient = videoFrame.locator( '.ytp-gradient-top' ),
			videoTitle = videoFrame.locator( '.ytp-show-cards-title' ),
			videoBottom = videoFrame.locator( '.ytp-impression-link' );

		await videoButton.evaluate( ( element ) => element.style.opacity = 0 );
		await videoGradient.evaluate( ( element ) => element.style.opacity = 0 );
		await videoTitle.evaluate( ( element ) => element.style.opacity = 0 );
		await videoBottom.evaluate( ( element ) => element.style.opacity = 0 );
	}

	/**
	 * Hide controls and overlays on map widgets.
	 *
	 * @return {Promise<void>}
	 */
	async hideMapControls() {
		await this.getPreviewFrame().waitForSelector( '.elementor-widget-google_maps iframe' );

		const mapFrame = this.getPreviewFrame().frameLocator( '.elementor-widget-google_maps iframe' ),
			mapText = mapFrame.locator( '.gm-style iframe + div + div' ),
			mapInset = mapFrame.locator( 'button.gm-inset-map.gm-inset-light' ),
			mapControls = mapFrame.locator( '.gmnoprint.gm-bundled-control.gm-bundled-control-on-bottom' );

		await mapText.evaluate( ( element ) => element.style.opacity = 0 );
		await mapInset.evaluate( ( element ) => element.style.opacity = 0 );
		await mapControls.evaluate( ( element ) => element.style.opacity = 0 );
	}

	/**
	 * Open the page in the Preview mode.
	 *
	 * @return {Promise<void>}
	 */
	async togglePreviewMode() {
		if ( ! await this.page.$( 'body.elementor-editor-preview' ) ) {
			await this.page.locator( '#elementor-mode-switcher' ).click();
			await this.page.waitForSelector( 'body.elementor-editor-preview' );
			await this.page.waitForTimeout( 500 );
		} else {
			await this.page.locator( '#elementor-mode-switcher-preview' ).click();
			await this.page.waitForSelector( 'body.elementor-editor-active' );
		}
	}

	async changeEditorLayout( layout ) {
		await this.page.locator( '#elementor-panel-footer-settings' ).click();
		await this.page.selectOption( '[data-setting=template]', layout );
		await this.ensurePreviewReload();
	}

	async ensurePreviewReload() {
		await this.page.waitForSelector( '#elementor-preview-loading' );
		await this.page.waitForSelector( '#elementor-preview-loading', { state: 'hidden' } );
	}

	/**
	 * Hide all editor elements from the screenshots.
	 *
	 * @return {Promise<void>}
	 */
	async hideEditorElements() {
		const css = '<style>.elementor-element-overlay,.elementor-empty-view{opacity: 0;}.elementor-widget,.elementor-widget:hover{box-shadow:none!important;}</style>';

		await this.addWidget( 'html' );
		await this.page.locator( '.elementor-control-type-code textarea' ).fill( css );
	}

	async changeUiTheme( uiMode ) {
		await this.page.locator( '#elementor-panel-header-menu-button' ).click();
		await this.page.click( '.elementor-panel-menu-item-editor-preferences' );
		await this.page.selectOption( '.elementor-control-ui_theme  select', uiMode );
	}

	/**
	 * Select a responsive view.
	 *
	 * @param {string} device - The name of the device breakpoint, such as `tablet_extra`;
	 *
	 * @return {Promise<void>}
	 */
	async changeResponsiveView( device ) {
		const hasResponsiveViewBar = await this.page.evaluate( () => {
			return document.querySelector( '#elementor-preview-responsive-wrapper' ).classList.contains( 'ui-resizable' );
		} );

		if ( ! hasResponsiveViewBar ) {
			await this.page.locator( '#elementor-panel-footer-responsive i' ).click();
		}

		await this.page.locator( `#e-responsive-bar-switcher__option-${ device } i` ).click();
	}

	async publishAndViewPage() {
		await this.page.locator( 'button#elementor-panel-saver-button-publish' ).click();
		await this.page.waitForLoadState();
		await Promise.all( [
			this.page.waitForResponse( '/wp-admin/admin-ajax.php' ),
			this.page.locator( '#elementor-panel-header-menu-button i' ).click(),
			this.page.waitForLoadState( 'networkidle' ),
			this.page.waitForSelector( '#elementor-panel-footer-saver-publish .elementor-button.e-primary.elementor-disabled' ),
		] );

		await this.page.locator( '.elementor-panel-menu-item-view-page > a' ).click();
		await this.page.waitForLoadState( 'networkidle' );
	}

	async previewChanges( context ) {
		const previewPagePromise = context.waitForEvent( 'page' );

		await this.page.locator( '#elementor-panel-footer-saver-preview' ).click();
		await this.page.waitForLoadState( 'networkidle' );

		const previewPage = await previewPagePromise;
		await previewPage.waitForLoadState();

		return previewPage;
	}

	/**
	 * Apply Element Settings
	 *
	 * Apply settings to a widget without having to navigate through its Panels and Sections to set each individual
	 * control value.
	 *
	 * You can get the Element settings by right-clicking an existing widget or element in the Editor, choose "Copy",
	 * then paste the content into a text editor and filter out just the settings you want to apply to your element.
	 *
	 * Example usage:
	 * ```
	 * await editor.applyElementSettings( 'cdefd82', {
	 *     background_background: 'classic',
	 *     background_color: 'rgb(255, 10, 10)',
	 * } );
	 * ```
	 *
	 * @param {string} elementId - Id of the element you intend to apply the settings to.
	 * @param {Object} settings  - Object settings from the Editor > choose element > right-click > "Copy".
	 *
	 * @return {Promise<void>}
	 */
	async applyElementSettings( elementId, settings ) {
		await this.page.evaluate(
			( args ) => $e.run( 'document/elements/settings', {
				container: elementor.getContainer( args.elementId ),
				settings: args.settings,
			} ),
			{ elementId, settings },
		);
	}

	/**
	 * Check if an item is in the viewport.
	 *
	 * @param {string} itemSelector
	 * @return {Promise<void>}
	 */
	async isItemInViewport( itemSelector ) {
		// eslint-disable-next-line no-shadow
		return this.page.evaluate( ( itemSelector ) => {
			let isVisible = false;

			const element = document.querySelector( itemSelector );

			if ( element ) {
				const rect = element.getBoundingClientRect();

				if ( rect.top >= 0 && rect.left >= 0 ) {
					const vw = Math.max( document.documentElement.clientWidth || 0, window.innerWidth || 0 ),
						vh = Math.max( document.documentElement.clientHeight || 0, window.innerHeight || 0 );

					if ( rect.right <= vw && rect.bottom <= vh ) {
						isVisible = true;
					}
				}
			}
			return isVisible;
		}, itemSelector );
	}
};
