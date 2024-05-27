import { addElement, getElementSelector } from '../assets/elements-utils';
import { expect, type Page, type Frame, type BrowserContext, type TestInfo } from '@playwright/test';
import BasePage from './base-page';
import EditorSelectors from '../selectors/editor-selectors';
import _path from 'path';
import { getComparator } from 'playwright-core/lib/utils';
import AxeBuilder from '@axe-core/playwright';
import { $eType, WindowType, BackboneType, ElementorType, ElementorFrontendConfig } from '../types/types';
let $e: $eType;
let elementor: ElementorType;
let Backbone: BackboneType;
let window: WindowType;
let elementorFrontendConfig: ElementorFrontendConfig;

export default class EditorPage extends BasePage {
	readonly previewFrame: Frame;
	postId: number | null;

	/**
	 * Create an Elementor editor page.
	 *
	 * @param {Page}     page        - Playwright page instance.
	 * @param {TestInfo} testInfo    - Test information.
	 * @param {number}   cleanPostId - Optional. Post ID.
	 *
	 * @return {void}
	 */
	constructor( page: Page, testInfo: TestInfo, cleanPostId: null | number = null ) {
		super( page, testInfo );
		this.previewFrame = this.getPreviewFrame();
		this.postId = cleanPostId;
	}

	/**
	 * Open a specific post in the elementor editor.
	 *
	 * @param {number|null} id - Optional. Post ID. Default is the ID of the current post.
	 *
	 * @return {Promise<void>}
	 */
	async gotoPostId( id = this.postId ) {
		await this.page.goto( `wp-admin/post.php?post=${ id }&action=elementor` );
		await this.page.waitForLoadState( 'load' );
		await this.waitForPanelToLoad();
	}

	/**
	 * Update image dates in the template data.
	 *
	 * @param {JSON} templateData - Template data.
	 *
	 * @return {JSON}
	 */
	updateImageDates( templateData: JSON ) {
		const date = new Date();
		const month = date.toLocaleString( 'default', { month: '2-digit' } );
		const data = JSON.stringify( templateData );
		const updatedData = data.replace( /[0-9]{4}\/[0-9]{2}/g, `${ date.getFullYear() }/${ month }` );
		return JSON.parse( updatedData ) as JSON;
	}

	/**
	 * Upload SVG in the Media Library. Expects media library to be open.
	 *
	 * @param {string} svgFileName - SVG file name without extension.
	 *
	 * @return {Promise<void>}
	 */
	async uploadSVG( svgFileName = undefined ) {
		const _svgFileName = svgFileName === undefined ? 'test-svg-wide' : svgFileName;
		const regex = new RegExp( _svgFileName );
		const response = this.page.waitForResponse( regex );
		await this.page.setInputFiles( EditorSelectors.media.imageInp, _path.resolve( __dirname, `../resources/${ _svgFileName }.svg` ) );
		await response;
		await this.page.getByRole( 'button', { name: 'Insert Media' } )
			.or( this.page.getByRole( 'button', { name: 'Select' } ) ).nth( 1 ).click();
	}

	/**
	 * Load a template from a file.
	 *
	 * @param {string}  filePath             - Path to the template file.
	 * @param {boolean} updateDatesForImages - Optional. Whether to update images dates. Default is false.
	 *
	 * @return {Promise<void>}
	 */
	async loadTemplate( filePath: string, updateDatesForImages = false ) {
		let templateData = await import( filePath ) as JSON;

		// For templates that use images, date when image is uploaded is hardcoded in template.
		// Element regression tests upload images before each test.
		// To update dates in template, use a flag updateDatesForImages = true
		if ( updateDatesForImages ) {
			templateData = this.updateImageDates( templateData );
		}

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

	/**
	 * Remove all the content from the page.
	 *
	 * @return {Promise<void>}
	 */
	async cleanContent() {
		await this.page.evaluate( () => {
			$e.run( 'document/elements/empty', { force: true } );
		} );
	}

	/**
	 * Wait for the editor panels to finish loading.
	 *
	 * @return {Promise<void>}
	 */
	async waitForPanelToLoad() {
		await this.page.waitForSelector( '.elementor-panel-loading', { state: 'detached' } );
		await this.page.waitForSelector( '#elementor-loading', { state: 'hidden' } );
	}

	/**
	 * Add element to the page using a model.
	 *
	 * @param {Object}  model               - Model definition.
	 * @param {string}  container           - Optional. Container to create the element in.
	 * @param {boolean} isContainerASection - Optional. Whether the container is a section.
	 *
	 * @return {Promise<string>} Element ID
	 */
	async addElement( model: unknown, container: null | string = null, isContainerASection = false ): Promise<string> {
		return await this.page.evaluate( addElement, { model, container, isContainerASection } );
	}

	/**
	 * Remove element from the page.
	 *
	 * @param {string} elementId - Element ID.
	 *
	 * @return {Promise<void>}
	 */
	async removeElement( elementId: string ) {
		await this.page.evaluate( ( { id } ) => {
			$e.run( 'document/elements/delete', {
				container: elementor.getContainer( id ),
			} );
		}, { id: elementId } );
	}

	/**
	 * Add a widget by `widgetType`.
	 *
	 * @param {string}  widgetType          - Widget type.
	 * @param {string}  container           - Optional. Container to create the element in.
	 * @param {boolean} isContainerASection - Optional. Whether the container is a section.
	 *
	 * @return {Promise<string>} The widget ID.
	 */
	async addWidget( widgetType: string, container = null, isContainerASection = false ): Promise<string> {
		const widgetId = await this.addElement( { widgetType, elType: 'widget' }, container, isContainerASection );
		await this.getPreviewFrame().waitForSelector( `[data-id='${ widgetId }']` );

		return widgetId;
	}

	/**
	 * Add a page by importing a Json page object from PostMeta _elementor_data into Tests
	 *
	 * @param {string}  dirName              - Directory name, use `__dirname` for the current directory.
	 * @param {string}  fileName             - Name of the file without extension.
	 * @param {string}  widgetSelector       - Selector of the widget.
	 * @param {boolean} updateDatesForImages - Optional. Whether to update image dates in the template. Default is false.
	 *
	 * @return {Promise<void>}
	 */
	async loadJsonPageTemplate( dirName: string, fileName: string, widgetSelector: string, updateDatesForImages = false ) {
		const filePath = _path.resolve( dirName, `./templates/${ fileName }.json` );
		const templateData = await import( filePath ) as JSON;
		const pageTemplateData =
		{
			content: templateData,
			page_settings: [],
			version: '0.4',
			title: 'Elementor Test',
			type: 'page',
		};

		// For templates that use images, date when image is uploaded is hardcoded in template.
		// Element regression tests upload images before each test.
		// To update dates in template, use a flag updateDatesForImages = true
		if ( updateDatesForImages ) {
			this.updateImageDates( templateData );
		}

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
		}, pageTemplateData );

		await this.waitForElement( false, widgetSelector );
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
	async getElementHandle( id: string ) {
		return this.getPreviewFrame().$( getElementSelector( id ) );
	}

	/**
	 * Get the frame of the Elementor editor preview.
	 */
	getPreviewFrame() {
		return this.page.frame( { name: 'elementor-preview-iframe' } );
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

		await this.openPageSettingsPanel();
		await this.setSelectControlValue( 'template', 'elementor_canvas' );
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

		await this.openPageSettingsPanel();
		await this.setSelectControlValue( 'template', 'default' );
		await this.getPreviewFrame().waitForSelector( '.elementor-default' );
	}

	/**
	 * Select an element inside the editor.
	 *
	 * @param {string} elementId - Element ID.
	 *
	 * @return {Object} element;
	 */
	async selectElement( elementId: string ) {
		await this.page.evaluate( ( { id } ) => {
			$e.run( 'document/elements/select', {
				container: elementor.getContainer( id ),
			} );
		}, { id: elementId } );

		await this.getPreviewFrame().waitForSelector( '.elementor-element-' + elementId + '.elementor-element-editable' );
		return this.getPreviewFrame().locator( '.elementor-element-' + elementId );
	}

	/**
	 * Copy an element inside the editor.
	 *
	 * @param {string} elementId - Element ID.
	 *
	 * @return {Promise<void>}
	 */
	async copyElement( elementId: string ) {
		const element = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId );
		await element.click( { button: 'right' } );

		const copyListItemSelector = '.elementor-context-menu-list__item-copy:visible';
		await this.page.waitForSelector( copyListItemSelector );
		await this.page.locator( copyListItemSelector ).click();
	}

	/**
	 * Paste an element inside the editor.
	 *
	 * @param {string} selector - Element selector.
	 *
	 * @return {Promise<void>}
	 */
	async pasteElement( selector: string ) {
		await this.getPreviewFrame().locator( selector ).click( { button: 'right' } );

		const pasteSelector = '.elementor-context-menu-list__group-paste .elementor-context-menu-list__item-paste';
		await this.page.locator( pasteSelector ).click();
	}

	/**
	 * Open the section that adds a new element.
	 *
	 * @param {string} elementId - Element ID.
	 *
	 * @return {Promise<void>}
	 */
	async openAddElementSection( elementId: string ) {
		const element = this.getPreviewFrame().locator( `.elementor-edit-mode .elementor-element-${ elementId }` );
		await element.hover();
		const elementAddButton = this.getPreviewFrame().locator( `.elementor-edit-mode .elementor-element-${ elementId } > .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-add` );
		await elementAddButton.click();
		await this.getPreviewFrame().waitForSelector( '.elementor-add-section-inline' );
	}

	/**
	 * Paste styling setting on the element.
	 *
	 * @param {string} elementId - Element ID.
	 *
	 * @return {Promise<void>}
	 */
	async pasteStyleElement( elementId: string ) {
		const element = this.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + elementId );
		await element.click( { button: 'right' } );

		const pasteListItemSelector = '.elementor-context-menu-list__item-pasteStyle:visible';
		await this.page.waitForSelector( pasteListItemSelector );
		await this.page.locator( pasteListItemSelector ).click();
	}

	/**
	 * Open a tab inside an Editor panel.
	 *
	 * @param {string} panelId - The panel tab to open.
	 *
	 * @return {Promise<void>}
	 */
	async openPanelTab( panelId: string ) {
		await this.page.waitForSelector( `.elementor-tab-control-${ panelId } span` );

		// Check if panel has been activated already.
		if ( await this.page.$( `.elementor-tab-control-${ panelId }.elementor-active` ) ) {
			return;
		}

		await this.page.locator( `.elementor-tab-control-${ panelId } span` ).click();
		await this.page.waitForSelector( `.elementor-tab-control-${ panelId }.elementor-active` );
	}

	/**
	 * Open a section in an active panel tab.
	 *
	 * @param {string} sectionId - The section to open.
	 *
	 * @return {Promise<void>}
	 */
	async openSection( sectionId: string ) {
		const sectionSelector = `.elementor-control-${ sectionId }`,
			isOpenSection = await this.page.evaluate( ( selector ) => {
				const sectionElement = document.querySelector( selector );

				return sectionElement?.classList.contains( 'e-open' ) || sectionElement?.classList.contains( 'elementor-open' );
			}, sectionSelector ),
			section = await this.page.$( sectionSelector + ':not( .e-open ):not( .elementor-open ):visible' );

		if ( ! section || isOpenSection ) {
			return;
		}

		await this.page.locator( sectionSelector + ':not( .e-open ):not( .elementor-open ):visible' + ' .elementor-panel-heading' ).click();
	}

	/**
	 * Set a custom width value to a widget.
	 *
	 * @param {string} width - The custom width value (as a percentage).
	 *
	 * @return {Promise<void>}
	 */
	async setWidgetCustomWidth( width = '100' ) {
		await this.openPanelTab( 'advanced' );
		await this.setSelectControlValue( '_element_width', 'initial' );
		await this.setSliderControlValue( '_element_custom_width', width );
	}

	/**
	 * Set tab control value.
	 *
	 * @param {string} controlId - The control to select.
	 * @param {string} tabId     - The tab to select.
	 *
	 * @return {Promise<void>}
	 */
	async setTabControlValue( controlId: string, tabId: string ) {
		await this.page.locator( `.elementor-control-${ controlId } .elementor-control-header_${ tabId }_title` ).first().click();
	}

	/**
	 * Set text control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} value     - The value to set.
	 *
	 * @return {Promise<void>}
	 */
	async setTextControlValue( controlId: string, value: string ) {
		await this.page.locator( `.elementor-control-${ controlId } input` ).fill( value.toString() );
	}

	/**
	 * Set textarea control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} value     - The value to set.
	 *
	 * @return {Promise<void>}
	 */
	async setTextareaControlValue( controlId: string, value: string ) {
		await this.page.locator( `.elementor-control-${ controlId } textarea` ).fill( value.toString() );
	}

	/**
	 * Set number control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} value     - The value to set.
	 *
	 * @return {Promise<void>}
	 */
	async setNumberControlValue( controlId: string, value: string ) {
		await this.page.locator( `.elementor-control-${ controlId } input >> nth=0` ).fill( value.toString() );
	}

	/**
	 * Set slider control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} value     - The value to set.
	 *
	 * @return {Promise<void>}
	 */
	async setSliderControlValue( controlId: string, value: string ) {
		await this.page.locator( `.elementor-control-${ controlId } .elementor-slider-input input` ).fill( value.toString() );
	}

	/**
	 * Update select control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} value     - The value to set.
	 *
	 * @return {Promise<void>}
	 */
	async setSelectControlValue( controlId: string, value: string ) {
		await this.page.selectOption( `.elementor-control-${ controlId } select`, value );
	}

	/**
	 * Set dimensions control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} value     - The value to set.
	 *
	 * @return {Promise<void>}
	 */
	async setDimensionsValue( controlId: string, value: string ) {
		await this.page.locator( `.elementor-control-${ controlId } .elementor-control-dimensions li:first-child input` ).fill( value );
	}

	/**
	 * Set choose control value.
	 *
	 * TODO: For consistency, we need to rewrite to logic, from icon based to value based.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} icon      - The icon to choose.
	 *
	 * @return {Promise<void>}
	 */
	async setChooseControlValue( controlId: string, icon: string ) {
		await this.page.locator( `.elementor-control-${ controlId } .${ icon }` ).click();
	}

	/**
	 * Set color control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} value     - The value to set.
	 *
	 * @return {Promise<void>}
	 */
	async setColorControlValue( controlId: string, value: string ) {
		const controlSelector = `.elementor-control-${ controlId }`;

		await this.page.locator( controlSelector + ' .pcr-button' ).click();
		await this.page.locator( '.pcr-app.visible .pcr-interaction input.pcr-result' ).fill( value );
		await this.page.locator( controlSelector ).click();
	}

	/**
	 * Update switcher control value.
	 *
	 * @param {string}  controlId - The control to set the value to.
	 * @param {boolean} value     - The value to set (true|false).
	 *
	 * @return {Promise<void>}
	 */
	async setSwitcherControlValue( controlId: string, value = true ) {
		const controlSelector = `.elementor-control-${ controlId }`,
			controlLabel = this.page.locator( controlSelector + ' label.elementor-switch' ),
			currentState = await this.page.locator( controlSelector + ' input[type="checkbox"]' ).isChecked();

		if ( currentState !== Boolean( value ) ) {
			await controlLabel.click();
		}
	}

	/**
	 * Set typography control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} fontsize  - Font size value.
	 *
	 * @return {Promise<void>}
	 */
	async setTypographyControlValue( controlId: string, fontsize: string ) {
		const controlSelector = `.elementor-control-${ controlId }_typography .eicon-edit`;

		await this.page.locator( controlSelector ).click();
		await this.setSliderControlValue( controlId + '_font_size', fontsize );
		await this.page.locator( controlSelector ).click();
	}

	/**
	 * Set shadow control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} type      [text|box]
	 *
	 * @return {Promise<void>}
	 */
	async setShadowControlValue( controlId: string, type: string ) {
		await this.page.locator( `.elementor-control-${ controlId }_${ type }_shadow_type i.eicon-edit` ).click();
		await this.page.locator( `.elementor-control-${ controlId }_${ type }_shadow_type label` ).first().click();
	}

	/**
	 * Set text stroke control value.
	 *
	 * @param {string} controlId - The control to set the value to.
	 * @param {string} type      [text]
	 * @param {number} value     [number]
	 * @param {string} color     [hex color]
	 *
	 * @return {Promise<void>}
	 */
	async setTextStrokeControlValue( controlId: string, type: string, value: number, color: string ) {
		await this.page.locator( `.elementor-control-${ controlId }_${ type }_stroke_type i.eicon-edit` ).click();
		await this.page.locator( `.elementor-control-${ controlId }_${ type }_stroke input[type="number"]` ).first().fill( value.toString() );
		await this.page.locator( `.elementor-control-${ controlId }_stroke_color .pcr-button` ).first().click();
		await this.page.locator( '.pcr-app.visible .pcr-result' ).first().fill( color );
		await this.page.locator( `.elementor-control-${ controlId }_${ type }_stroke_type label` ).first().click();
	}

	/**
	 * Set a widget mask.
	 *
	 * @return {Promise<void>}
	 */
	async setWidgetMask() {
		await this.openSection( '_section_masking' );
		await this.setSwitcherControlValue( '_mask_switch', true );
		await this.setSelectControlValue( '_mask_size', 'custom' );
		await this.setSliderControlValue( '_mask_size_scale', '30' );
		await this.setSelectControlValue( '_mask_position', 'top right' );
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

		await videoButton.evaluate( ( element ) => element.style.opacity = '0' );
		await videoGradient.evaluate( ( element ) => element.style.opacity = '0' );
		await videoTitle.evaluate( ( element ) => element.style.opacity = '0' );
		await videoBottom.evaluate( ( element ) => element.style.opacity = '0' );
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

		await mapText.evaluate( ( element ) => element.style.opacity = '0' );
		await mapInset.evaluate( ( element ) => element.style.opacity = '0' );
		await mapControls.evaluate( ( element ) => element.style.opacity = '0' );
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

	/**
	 * Change the WordPress template layout.
	 *
	 * @param {string} layout - The layout template to change to.
	 *
	 * @return {Promise<void>}
	 */
	async changeEditorLayout( layout: string ) {
		await this.openPageSettingsPanel();
		await this.setSelectControlValue( 'template', layout );
		await this.waitForPreviewToLoad();
	}

	/**
	 * Wait for the Elementor preview to finish loading.
	 *
	 * @return {Promise<void>}
	 */
	async waitForPreviewToLoad() {
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

	/**
	 * Whether the Top Bar is active or not.
	 *
	 * @return {Promise<boolean>}
	 */
	async hasTopBar(): Promise<boolean> {
		return await this.page.locator( EditorSelectors.panels.topBar.wrapper ).isVisible();
	}

	/**
	 * Click on a top bar item.
	 *
	 * @param {string} text - The text of the top bar button.
	 *
	 * @return {Promise<void>}
	 */
	async clickTopBarItem( text: string ) {
		await this.page.locator( EditorSelectors.panels.topBar.wrapper ).getByText( text ).click();
	}

	/**
	 * Open the menu panel.
	 *
	 * @return {Promise<void>}
	 */
	async openMenuPanel() {
		await this.page.locator( EditorSelectors.panels.menu.footerButton ).click();
		await this.page.locator( EditorSelectors.panels.menu.wrapper ).waitFor();
	}

	/**
	 * Open the elements/widgets panel.
	 *
	 * @return {Promise<void>}
	 */
	async openElementsPanel() {
		const hasTopBar = await this.hasTopBar();

		if ( hasTopBar ) {
			await this.clickTopBarItem( 'Elements' );
		} else {
			await this.page.locator( EditorSelectors.panels.elements.footerButton ).click();
		}

		await this.page.locator( EditorSelectors.panels.elements.wrapper ).waitFor();
	}

	/**
	 * Open the page settings panel.
	 *
	 * @return {Promise<void>}
	 */
	async openPageSettingsPanel() {
		const hasTopBar = await this.hasTopBar();

		if ( hasTopBar ) {
			await this.clickTopBarItem( 'Page Settings' );
		} else {
			await this.page.locator( EditorSelectors.panels.pageSettings.footerButton ).click();
		}

		await this.page.locator( EditorSelectors.panels.pageSettings.wrapper ).waitFor();
	}

	/**
	 * Open the site settings panel.
	 *
	 * @return {Promise<void>}
	 */
	async openSiteSettings() {
		const hasTopBar = await this.hasTopBar();

		if ( hasTopBar ) {
			await this.clickTopBarItem( 'Site Settings' );
		} else {
			await this.openMenuPanel();
			await this.page.locator( EditorSelectors.panels.siteSettings.menuPanelItem ).click();
		}

		await this.page.locator( EditorSelectors.panels.siteSettings.wrapper ).waitFor();
	}

	/**
	 * Open the user preferences panel.
	 *
	 * @return {Promise<void>}
	 */
	async openUserPreferencesPanel() {
		const hasTopBar = await this.hasTopBar();

		if ( hasTopBar ) {
			await this.clickTopBarItem( 'Elementor logo' );
			await this.page.locator( 'body' ).getByText( 'User Preferences' ).click();
		} else {
			await this.openMenuPanel();
			await this.page.locator( EditorSelectors.panels.userPreferences.menuPanelItem ).click();
		}

		await this.page.locator( EditorSelectors.panels.userPreferences.wrapper ).waitFor();
	}

	/**
	 * Open the navigator/structure panel.
	 *
	 * @return {Promise<void>}
	 */
	async openNavigator( ) {
		const isOpen = await this.previewFrame.evaluate( () => elementor.navigator.isOpen() );

		if ( isOpen ) {
			return;
		}

		const hasTopBar = await this.hasTopBar();

		if ( hasTopBar ) {
			await this.clickTopBarItem( 'Structure' );
		} else {
			await this.page.locator( EditorSelectors.panels.navigator.footerButton ).click();
		}

		await this.page.locator( EditorSelectors.panels.siteSettings.wrapper ).waitFor();
	}

	/**
	 * Close the navigator/structure panel.
	 *
	 * @return {Promise<void>}
	 */
	async closeNavigatorIfOpen() {
		const isOpen = await this.getPreviewFrame().evaluate( () => elementor.navigator.isOpen() );

		if ( ! isOpen ) {
			return;
		}

		await this.page.locator( EditorSelectors.panels.navigator.closeButton ).click();
	}

	/**
	 * Change the display mode of the editor.
	 *
	 * @param {string} uiMode - Either 'light', 'dark', or 'auto'.
	 *
	 * @return {Promise<void>}
	 */
	async setDisplayMode( uiMode: string ) {
		const uiThemeOptions = {
			light: 'eicon-light-mode',
			dark: 'eicon-dark-mode',
			auto: 'eicon-header',
		};

		await this.openUserPreferencesPanel();
		await this.setChooseControlValue( 'ui_theme', uiThemeOptions[ uiMode ] );
	}

	/**
	 * Select a responsive view.
	 *
	 * @param {string} device - The name of the device breakpoint, such as `tablet_extra`.
	 *
	 * @return {Promise<void>}
	 */
	async changeResponsiveView( device: string ) {
		const hasResponsiveViewBar = await this.page.evaluate( () => {
			return document.querySelector( '#elementor-preview-responsive-wrapper' ).classList.contains( 'ui-resizable' );
		} );

		if ( ! hasResponsiveViewBar ) {
			await this.page.locator( '#elementor-panel-footer-responsive i' ).click();
		}

		await this.page.locator( `#e-responsive-bar-switcher__option-${ device } i` ).click();
	}

	/**
	 * Publish the current page.
	 *
	 * @return {Promise<void>}
	 */
	async publishPage() {
		await this.page.locator( 'button#elementor-panel-saver-button-publish' ).click();
		await this.page.waitForLoadState();
		await this.page.getByRole( 'button', { name: 'Update' } ).waitFor();
	}

	/**
	 * Publish the current page and view it.
	 *
	 * @return {Promise<void>}
	 */
	async publishAndViewPage() {
		await this.publishPage();
		await this.page.locator( '#elementor-panel-header' ).getByRole( 'button', { name: 'Menu' } ).click();
		await this.page.getByRole( 'link', { name: 'View Page' } ).click();
		await this.page.waitForLoadState();
	}

	/**
	 * Save and reload the current page.
	 *
	 * @return {Promise<void>}
	 */
	async saveAndReloadPage() {
		await this.page.locator( 'button#elementor-panel-saver-button-publish' ).click();
		await this.page.waitForLoadState();
		await this.page.waitForResponse( '/wp-admin/admin-ajax.php' );
		await this.page.reload();
	}

	/**
	 * Preview the changes made in the editor.
	 *
	 * @param {BrowserContext} context - The browser context.
	 *
	 * @return {Promise<void>}
	 */
	async previewChanges( context: BrowserContext ) {
		const previewPagePromise = context.waitForEvent( 'page' );

		await this.page.locator( '#elementor-panel-footer-saver-preview' ).click();
		await this.page.waitForLoadState( 'networkidle' );

		const previewPage = await previewPagePromise;
		await previewPage.waitForLoadState();

		return previewPage;
	}

	/**
	 * Edit current page from the Front End.
	 *
	 * @return {Promise<void>}
	 */
	async editCurrentPage() {
		const postId = await this.getPageIdFromFrontEnd();
		expect( postId, 'No Post/Page ID returned when calling getPageIdFromFrontEnd().' ).toBeTruthy();
		await this.gotoPostId( postId );
	}

	/**
	 * Get the current page ID.
	 *
	 * @return {Promise<string>}
	 */
	async getPageId(): Promise<string> {
		return await this.page.evaluate( () => elementor.config.initial_document.id );
	}

	/**
	 * Get the current page ID from the Front End.
	 *
	 * @return {Promise<string>}
	 */
	async getPageIdFromFrontEnd() {
		return await this.page.evaluate( () => elementorFrontendConfig.post.id );
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
	async applyElementSettings( elementId: string, settings: unknown ) {
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
	 * @param {string} itemSelector - The item selector.
	 *
	 * @return {Promise<boolean>}
	 */
	async isItemInViewport( itemSelector: string ): Promise<boolean> {
		return this.page.evaluate( ( item: string ) => {
			let isVisible = false;

			const element: HTMLElement = document.querySelector( item );

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

	/**
	 * Get the number of widgets in the editor.
	 *
	 * @return {Promise<number>}
	 */
	async getWidgetCount(): Promise<number> {
		return ( await this.getPreviewFrame().$$( EditorSelectors.widget ) ).length;
	}

	/**
	 * Get the widget element.
	 *
	 * @return {string} Elementor widget.
	 */
	getWidget() {
		return this.getPreviewFrame().locator( EditorSelectors.widget );
	}

	async waitForElementRender( id: string ) {
		if ( null === id ) {
			throw new Error( 'Id is null' );
		}

		const loadingElement = `.elementor-element-${ id }.elementor-loading`;
		let isLoading: boolean;

		try {
			await this.getPreviewFrame().waitForSelector( loadingElement, { timeout: 500 } );

			isLoading = true;
		} catch ( e ) {
			isLoading = false;
		}

		if ( isLoading ) {
			await this.getPreviewFrame().waitForSelector( loadingElement, { state: 'detached' } );
		}
	}

	async waitForIframeToLoaded( widgetType: string, isPublished = false ) {
		const frames = {
			video: [ EditorSelectors.video.iframe, EditorSelectors.video.playIcon ],
			google_maps: [ EditorSelectors.googleMaps.iframe, EditorSelectors.googleMaps.showSatelliteViewBtn ],
			sound_cloud: [ EditorSelectors.soundCloud.iframe, EditorSelectors.soundCloud.waveForm ],
		};

		if ( ! ( widgetType in frames ) ) {
			return;
		}

		if ( isPublished ) {
			await this.page.locator( frames[ widgetType ][ 0 ] ).first().waitFor();
			const count = await this.page.locator( frames[ widgetType ][ 0 ] ).count();
			for ( let i = 1; i < count; i++ ) {
				await this.page.frameLocator( frames[ widgetType ][ 0 ] ).nth( i ).locator( frames[ widgetType ][ 1 ] ).waitFor();
			}
		} else {
			const frame = this.getPreviewFrame();
			await frame.waitForLoadState();
			await frame.waitForSelector( frames[ widgetType ][ 0 ] );
			await frame.frameLocator( frames[ widgetType ][ 0 ] ).first().locator( frames[ widgetType ][ 1 ] ).waitFor();
			const iframeCount: number = await new Promise( ( resolved ) => {
				resolved( frame.childFrames().length );
			} );
			for ( let i = 1; i < iframeCount; i++ ) {
				await frame.frameLocator( frames[ widgetType ][ 0 ] ).nth( i ).locator( frames[ widgetType ][ 1 ] ).waitFor();
			}
		}
	}

	/**
	 * Wait for the element to be visible.
	 *
	 * @param {boolean} isPublished - Whether the element is published.
	 * @param {string}  selector    - Element selector.
	 *
	 * @return {Promise<void>}
	 */
	async waitForElement( isPublished: boolean, selector: string ) {
		if ( selector === undefined ) {
			return;
		}

		if ( isPublished ) {
			await this.page.waitForSelector( selector );
		} else {
			const frame = this.getPreviewFrame();
			await frame.waitForLoadState();
			await frame.waitForSelector( selector );
		}
	}

	/**
	 * Verify class in element.
	 *
	 * @param {Object}  args
	 * @param {string}  args.selector
	 * @param {string}  args.className
	 * @param {boolean} args.isPublished
	 *
	 * @return {Promise<void>}
	 */
	async verifyClassInElement( args: { selector: string, className: string, isPublished: boolean } ) {
		const regex = new RegExp( args.className );
		if ( args.isPublished ) {
			await expect( this.page.locator( args.selector ) ).toHaveClass( regex );
		} else {
			await expect( this.getPreviewFrame().locator( args.selector ) ).toHaveClass( regex );
		}
	}

	/**
	 * Verify image size.
	 *
	 * @param {Object}  args
	 * @param {string}  args.selector
	 * @param {number}  args.width
	 * @param {number}  args.height
	 * @param {boolean} args.isPublished
	 *
	 * @return {Promise<void>}
	 */
	async verifyImageSize( args: { selector: string, width: number, height: number, isPublished: boolean } ) {
		const imageSize = args.isPublished
			? await this.page.locator( args.selector ).boundingBox()
			: await this.getPreviewFrame().locator( args.selector ).boundingBox();
		expect( imageSize.width ).toEqual( args.width );
		expect( imageSize.height ).toEqual( args.height );
	}

	/**
	 * Checks for a stable UI state by comparing screenshots at intervals and expecting a match.
	 * Can be used to check for completed rendering. Useful to wait out animations before screenshots and expects.
	 * Should be less flaky than waitForLoadState( 'load' ) in editor where Ajax re-rendering is triggered.
	 *
	 * @param {*}      locator - The locator to check for.
	 * @param {number} retries - Optional. Number of retries. Default is 3.
	 * @param {number} timeout - Optional. Time to wait between retries, in milliseconds. Default is 500.
	 *
	 * @return {Promise<void>}
	 */
	async isUiStable( locator, retries = 3, timeout = 500 ) {
		const comparator = getComparator( 'image/png' );
		let retry = 0,
			beforeImage,
			afterImage;

		do {
			if ( retry === retries ) {
				break;
			}

			beforeImage = await locator.screenshot( {
				path: `./before.png`,
			} );

			await new Promise( ( resolve ) => setTimeout( resolve, timeout ) );

			afterImage = await locator.screenshot( {
				path: `./after.png`,
			} );
			retry = retry++;
		} while ( null !== comparator( beforeImage, afterImage ) );
	}

	/**
	 * Run accessibility test using @Axe-Core.
	 *
	 * @param {Page}   page     - Playwright page instance.
	 * @param {string} selector - The selector to test.
	 *
	 * @return {Promise<void>}
	 */
	async axeCoreAccessibilityTest( page, selector: string ) {
		const accessibilityScanResults = await new AxeBuilder( { page } ).include( selector ).analyze();
		expect.soft( accessibilityScanResults.violations ).toEqual( [] );
	}

	/**
	 * Remove classes from the page.
	 *
	 * @param {string} className - The class to remove.
	 *
	 * @return {Promise<void>}
	 */
	async removeClasses( className: string ) {
		await this.page.evaluate( async ( _class ) => {
			await new Promise( ( resolve1 ) => {
				const elems = document.querySelectorAll( `.${ _class }` );

				[].forEach.call( elems, function( el: HTMLElement ) {
					el.classList.remove( _class );
				} );
				resolve1( 'Foo' );
			} );
		}, className );
	}

	/**
	 * Scroll the page.
	 *
	 * @return {Promise<void>}
	 */
	async scrollPage() {
		await this.page.evaluate( async () => {
			await new Promise( ( resolve1 ) => {
				let totalHeight = 0;
				const distance = 400;
				const timer = setInterval( () => {
					const scrollHeight = document.body.scrollHeight;
					window.scrollBy( 0, distance );
					totalHeight += distance;
					if ( totalHeight >= scrollHeight ) {
						clearInterval( timer );
						window.scrollTo( 0, 0 );
						resolve1( 'Foo' );
					}
				}, 100 );
			} );
		} );
	}

	/**
	 * Remove the WordPress admin bar.
	 *
	 * @return {Promise<void>}
	 */
	async removeWpAdminBar() {
		const adminBar = 'wpadminbar';
		await this.page.locator( `#${ adminBar }` ).waitFor( { timeout: 10000 } );
		await this.page.evaluate( ( selector ) => {
			const admin = document.getElementById( selector );
			admin.remove();
		}, adminBar );
	}

	/**
	 * Isolated ID number.
	 *
	 * @param {string} idPrefix - The prefix of the item.
	 * @param {string} itemID   - The item ID.
	 *
	 * @return {Promise<number>}
	 */
	async isolatedIdNumber( idPrefix: string, itemID: string ): Promise<number> {
		return Number( itemID.replace( idPrefix, '' ) );
	}
}
