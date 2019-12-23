import BaseCommand from 'elementor-document/commands/base/base';

export default class Base extends BaseCommand {
	initialize( args ) {
		super.initialize( args );

		this.document = elementor.documents.getCurrent();
		/**
		 * Will recursively assign document to all save commands,
		 * affect all commands stack trace ( commands called within the command ).
		 */
		args = Object.assign( args, { document: this.document } );
	}
}
