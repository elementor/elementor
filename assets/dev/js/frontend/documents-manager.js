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
		const documentElements = jQuery( this.getSettings( 'selectors' ).document ).toArray();

		this.removeDocumentsBasedOnCurrentElements( documentElements );

		documentElements.forEach( ( element ) => this.attachDocumentClass( jQuery( element ) ) );

		this.trigger( 'attach-documents' );
	}

	removeDocumentsBasedOnCurrentElements( elements = [] ) {
		Object.keys( this.documents ).forEach( ( documentId ) => {
			const newElements = this.documents[ documentId ]
				.getSettings( 'elements' )
				.reduce( ( carry, element ) => {
					if ( elements.includes( element ) ) {
						carry.push( element );
					}

					return carry;
				}, [] );

			if ( 0 === newElements.length ) {
				delete this.documents[ documentId ];

				return;
			}

			this.documents[ documentId ].setSettings( 'elements', newElements );
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
