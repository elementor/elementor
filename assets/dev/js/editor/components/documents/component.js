import ComponentBase from 'elementor-api/modules/component-base';
import Document from './document';
import * as commands from './commands/';
import * as internalCommands from './commands/internal/';
import * as hooks from './hooks';
import { getQueryParam } from 'elementor-editor-utils/query-params';

export default class Component extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		/**
		 * All the documents.
		 *
		 * @type {Object.<Document>}
		 */
		this.documents = {};

		/**
		 * Current document.
		 *
		 * @type {Document}
		 */
		this.currentDocument = null;

		this.saveInitialDocumentToCache();
	}

	getNamespace() {
		return 'editor/documents';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultCommandsInternal() {
		return this.importCommands( internalCommands );
	}

	/**
	 * Function add().
	 *
	 * Add's document to the manager.
	 *
	 * @param {Document} document
	 *
	 * @return {Document} document
	 */
	add( document ) {
		const { id } = document;

		// Save the document.
		this.documents[ id ] = document;

		return document;
	}

	/**
	 * Function addDocumentByConfig().
	 *
	 * Add document to manager by config.
	 *
	 * @param {{}} config
	 *
	 * @return {Document} document
	 */
	addDocumentByConfig( config ) {
		return this.add( new Document( config ) );
	}

	/**
	 * Function get().
	 *
	 * Get document by id.
	 *
	 * @param {number} id
	 *
	 * @return {Document|boolean} document, or false if doesn't exist
	 */
	get( id ) {
		if ( undefined !== this.documents[ id ] ) {
			return this.documents[ id ];
		}

		if ( this.isGlobalPanelCommand() ) {
			const activeDocumentId = this.getActiveDocumentId();

			if ( ! isNaN( activeDocumentId ) && parseInt( id ) === activeDocumentId ) {
				return this.getMockDocument();
			}
		}

		return false;
	}

	isGlobalPanelCommand() {
		const hash = window.location.hash;
		const globalPanelHashes = [
			'#e:run:panel/global/open',
		];

		return globalPanelHashes.some( ( panelHash ) => hash.includes( panelHash ) );
	}

	getActiveDocumentId() {
		return parseInt( getQueryParam( 'active-document' ) );
	}

	getMockDocument() {
		const initialConfig = elementor.config.initial_document || {};
		const activeDocumentId = this.getActiveDocumentId() || initialConfig?.id || 1;

		return {
			id: activeDocumentId,
			config: {
				type: initialConfig.type || 'page',
				status: initialConfig.status || { value: 'publish', label: 'Published' },
				user: initialConfig.user || { can_publish: true },
				revisions: initialConfig.revisions || { current_id: activeDocumentId },
				panel: {
					title: initialConfig.panel?.title || 'Page',
					default_route: initialConfig.panel?.default_route || 'panel/elements/categories',
					has_elements: initialConfig.panel?.has_elements !== false,
					show_navigator: initialConfig.panel?.show_navigator !== false,
					allow_adding_widgets: initialConfig.panel?.allow_adding_widgets !== false,
					widgets_settings: initialConfig.panel?.widgets_settings || {},
					elements_categories: initialConfig.panel?.elements_categories || {},
					messages: initialConfig.panel?.messages || {},
					show_copy_and_share: initialConfig.panel?.show_copy_and_share || false,
					library_close_title: initialConfig.panel?.library_close_title || 'Close',
					publish_button_title: initialConfig.panel?.publish_button_title || 'Publish',
					allow_closing_remote_library: initialConfig.panel?.allow_closing_remote_library !== false,
					...initialConfig.panel,
				},
				...initialConfig,
			},
			container: {
				settings: {
					get: ( key ) => {
						if ( 'post_title' === key ) {
							return initialConfig.title || 'Document';
						}
						return null;
					},
				},
			},
			$element: null,
			editor: {
				status: 'loading',
				isChanged: false,
				isSaving: false,
			},
		};
	}

	getCurrent() {
		if ( this.currentDocument ) {
			return this.currentDocument;
		}

		if ( this.isGlobalPanelCommand() ) {
			this.ensureGlobalDocumentConfig();
			return this.getMockDocument();
		}

		return null;
	}

	ensureGlobalDocumentConfig() {
		if ( !! elementor?.config?.document ) {
			return;
		}

		const mockDocument = this.getMockDocument();
		elementor.config.document = mockDocument.config;
	}

	getCurrentId() {
		if ( this.currentDocument ) {
			return this.currentDocument.id;
		}

		if ( ! this.isGlobalPanelCommand() ) {
			return null;
		}

		const activeDocumentId = this.getActiveDocumentId();

		if ( ! isNaN( activeDocumentId ) ) {
			return activeDocumentId;
		}

		return this.getInitialId();
	}

	getInitialId() {
		return elementor.config.initial_document.id;
	}

	setInitialById( id ) {
		const document = this.get( id );

		if ( ! document ) {
			return;
		}

		elementor.config.initial_document = document.config;
		elementorCommon.ajax.addRequestConstant( 'initial_document_id', document.id );
	}

	/**
	 * Function setCurrent().
	 *
	 * set current document by document instance.
	 *
	 * @param {Document} document
	 */
	setCurrent( document ) {
		if ( undefined === this.documents[ document.id ] ) {
			throw Error( `The document with id: '${ document.id }' does not exist/loaded` );
		}

		if ( this.currentDocument ) {
			this.currentDocument.editor.status = 'closed';
		}

		this.currentDocument = this.documents[ document.id ];
		this.currentDocument.editor.status = 'open';

		elementorCommon.ajax.addRequestConstant( 'editor_post_id', document.id );
	}

	isCurrent( id ) {
		const currentId = this.getCurrentId();
		return currentId ? parseInt( id ) === currentId : false;
	}

	unsetCurrent() {
		this.currentDocument = null;
		elementorCommon.ajax.addRequestConstant( 'editor_post_id', null );
	}

	request( id ) {
		return elementorCommon.ajax.load( this.getRequestArgs( id ), true );
	}

	invalidateCache( id = null ) {
		if ( id ) {
			elementorCommon.ajax.invalidateCache( this.getRequestArgs( id ) );
			return;
		}

		Object.keys( this.documents ).forEach( ( docId ) => {
			elementorCommon.ajax.invalidateCache( this.getRequestArgs( docId ) );
		} );
	}

	getRequestArgs( id ) {
		id = parseInt( id );

		return {
			action: 'get_document_config',
			unique_id: `document-${ id }`,
			data: { id },
			success: ( config ) => config,
			error: ( data ) => {
				let message;

				if ( _.isString( data ) ) {
					message = data;
				} else if ( data.statusText ) {
					message = elementor.createAjaxErrorMessage( data );

					if ( 0 === data.readyState ) {
						message += ' ' + __( 'Cannot load editor', 'elementor' );
					}
				} else if ( data[ 0 ] && data[ 0 ].code ) {
					message = __( 'Server Error', 'elementor' ) + ' ' + data[ 0 ].code;
				}

				// eslint-disable-next-line no-alert
				alert( message );
			},
		};
	}

	/**
	 * Temp: Don't request initial document via ajax.
	 * Keep the event `elementor:init` before `preview:loaded`.
	 */
	saveInitialDocumentToCache() {
		const document = elementor.config.initial_document;
		elementorCommon.ajax.addRequestCache( this.getRequestArgs( document.id ), document );
	}
}
