import BaseCommand from 'elementor-document/commands/base/base';

export default class Base extends BaseCommand {
	initialize( args ) {
		super.initialize( args );

		const { document = undefined, documentId = undefined } = args;

		if ( documentId ) {
			this.document = elementor.documents.get( documentId );
		} else if ( document ) {
			this.document = document;
		} else {
			this.document = elementor.documents.getCurrent();
		}

		/**
		 * Will recursively assign document to all save commands,
		 * affect all commands stack trace ( commands called within the command ).
		 */
		args = Object.assign( args, { document: this.document } );
	}

	validateArgs( args ) {
		const { document = undefined, documentId = undefined } = args;

		if ( undefined !== document && undefined !== documentId ) {
			throw Error( 'document and documentId cannot go together please select one of them.' );
		}
	}
}
