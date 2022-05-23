import Document from './document';

export default class extends elementorModules.ViewModule {
	constructor( ...args ) {
		super( ...args );

		this.documents = {};

		this.initDocumentClasses();

		this.attachDocumentsClasses();

		// Runs only on the editor
		elementor?.on( 'document/widget/remote-render', ( view ) => {
			this.attachDocumentsClasses( view.$el );
		} );
	}

	getDefaultSettings() {
		return {
			selectors: {
				document: '.elementor',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$documents: jQuery( selectors.document ),
		};
	}

	initDocumentClasses() {
		this.documentClasses = {
			base: Document,
		};

		elementorFrontend.hooks.doAction( 'elementor/frontend/documents-manager/init-classes', this );
	}

	addDocumentClass( documentType, documentClass ) {
		this.documentClasses[ documentType ] = documentClass;
	}

	attachDocumentsClasses( $parentEl = jQuery( 'body' ) ) {
		let documentElements = $parentEl.find( this.getSettings( 'selectors' ).document )
			.toArray()
			.reduce( ( carry, element ) => {
				// Removes duplicate documents, only the first one remains.
				const { elementorId: documentId } = element.dataset;

				if ( ! carry.hasOwnProperty( documentId ) ) {
					carry[ documentId ] = element;
				}

				return carry;
			}, {} );

		documentElements = Object.values( documentElements );

		if ( 0 === documentElements.length ) {
			return;
		}

		const documentInstances = documentElements.map( ( element ) => this.attachDocumentClass( jQuery( element ) ) );

		elementor?.trigger( 'elementor/frontend/documents-manager/attach-document-classes', documentInstances );
	}

	attachDocumentClass( $document ) {
		const documentData = $document.data(),
			documentID = documentData.elementorId,
			documentType = documentData.elementorType,
			DocumentClass = this.documentClasses[ documentType ] || this.documentClasses.base,
			documentInstance = new DocumentClass( {
				$element: $document,
				id: documentID,
			} );

		this.documents[ documentID ] = documentInstance;

		return documentInstance;
	}
}
