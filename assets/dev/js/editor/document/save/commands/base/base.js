import BaseCommand from 'elementor-document/commands/base/base';

export default class Base extends BaseCommand {
	initialize( args ) {
		super.initialize( args );

		const { document = elementor.documents.getCurrent() } = args;

		this.document = document;
	}
}
