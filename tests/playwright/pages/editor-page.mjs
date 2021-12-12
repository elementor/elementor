import BasePage from './base-page.mjs';
import { getElementSelector, addElement } from '../assets/elements-utils.mjs';
import DocumentElementsHelper from '../../utils/js/document-elements-helper.mjs';

export default class EditorPage extends BasePage {
	isPanelLoaded = false;

	constructor( page, testInfo ) {
		super( page, testInfo )

		/**
		 * @type {(typeof DocumentElementsHelper)}
		 */
		this.helper = new Proxy( DocumentElementsHelper , {
			get: ( target, name ) => {
				return ( ...args ) => {
					return this.page.evaluate( target[name], args );
				};
			},
		} );

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

		this.isPanelLoaded = true;
	}

	/**
	 * Add element to the page using a model.
	 *
	 * TODO use 'DocumentElementsHelper'.
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
