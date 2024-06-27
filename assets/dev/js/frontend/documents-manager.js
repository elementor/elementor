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
			baseDocuments: [ selectors.document ],
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
		this.elements?.baseDocuments.forEach( ( baseDocument) => this.attachDocumentClass.bind( baseDocument ) );
	}

	attachDocumentClass( baseDocument ) {
		const documentData = baseDocument.dataset,
			documentID = documentData.elementorId,
			documentType = documentData.elementorType,
			DocumentClass = this.documentClasses[ documentType ] || this.documentClasses.base;

		this.documents[ documentID ] = new DocumentClass( {
			baseElement: baseDocument,
			id: documentID,
		} );
	}
}
