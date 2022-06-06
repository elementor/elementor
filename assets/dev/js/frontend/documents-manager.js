import Document from './document';

export default class extends elementorModules.ViewModule {
	constructor( ...args ) {
		super( ...args );

		this.documents = {};

		this.initDocumentClasses();

		this.attachDocumentsClasses();
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

	attachDocumentsClasses() {
		const documentElements = Object.values(
			jQuery( this.getSettings( 'selectors' ).document ).toArray()
		);

		if ( 0 === documentElements.length ) {
			return;
		}

		this.removeDocumentsBasedOnCurrentElements( documentElements );

		const documentInstances = documentElements.map( ( element ) => this.attachDocumentClass( jQuery( element ) ) );

		this.trigger( 'attach-documents' );
	}

	removeDocumentsBasedOnCurrentElements( elements = [] ) {
		const documentIds = elements.map( ( element ) => element.dataset?.elementorId || null );

		Object.keys( this.documents ).forEach( ( documentId ) => {
			if ( ! documentIds.includes( documentId ) ) {
				delete this.documents[ documentId ];
			}
		} );
	}

	attachDocumentClass( $document ) {
		const documentData = $document.data(),
			documentID = documentData.elementorId;

		if ( ! this.documents[ documentID ] ) {
			const documentType = documentData.elementorType,
				DocumentClass = this.documentClasses[ documentType ] || this.documentClasses.base,
				documentInstance = new DocumentClass( {
					$element: $document, // Main element, remains for BC.
					elements: [],
					id: documentID,
				} );

			this.documents[ documentID ] = documentInstance;
		}

		const elements = this.documents[ documentID ].getSettings( 'elements' ) || [];

		if ( ! elements.includes( $document.get( 0 ) ) ) {
			this.documents[ documentID ].setSettings(
				'elements',
				[
					...elements,
					$document.get( 0 ),
				]
			);
		}

		return this.documents[ documentID ];
	}
}
