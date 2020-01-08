import Document from './document';

/**
 * TODO: merge all documents managers, and create one global.
 */
export default class Manager {
	constructor() {
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

		this.initialize();
	}

	/**
	 * Function initialize().
	 *
	 * Initialize manager, add current document.
	 */
	initialize() {
		// Get current document id.
		const { id } = elementor.config.document,
			document = new Document( id, elementor.getPreviewContainer() );

		// Add new document to manager.
		this.currentDocument = this.add( document );
	}

	/**
	 * Function add().
	 *
	 * Add's document to the manager.
	 *
	 * @param {Document} document
	 *
	 * @returns {Document}
	 */
	add( document ) {
		const { id } = document;

		// Validate document is not already in use.
		if ( this.documents[ id ] ) {
			throw new Error( `Document with id: '${ id }', is already exist` );
		}

		// Save the document.
		this.documents[ id ] = document;

		return document;
	}

	/**
	 * Function addDocumentById().
	 *
	 * Add document to manager by id.
	 *
	 * @param {number} id
	 * @param {Container} container
	 *
	 * @returns {Document}
	 */
	addDocumentById( id, container ) {
		return this.add( new Document( id, container ) );
	}

	/**
	 * Function get().
	 *
	 * Get document by id.
	 *
	 * @param {number} id
	 *
	 * @returns {Document}
	 */
	get( id ) {
		if ( undefined !== this.documents[ id ] ) {
			return this.documents[ id ];
		}

		throw Error( `Invalid document id: ${ id }` );
	}

	/**
	 * Function getCurrent().
	 *
	 * Return's current document.
	 *
	 * @returns {Document}
	 */
	getCurrent() {
		return this.currentDocument;
	}

	/**
	 * Function getCurrentId().
	 *
	 * Return's current document id.
	 *
	 * @returns {number}
	 */
	getCurrentId() {
		return this.currentDocument.id;
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

		this.currentDocument = this.documents[ document.id ];

		elementorCommon.ajax.addRequestConstant( 'editor_post_id', document.id );
	}
}
