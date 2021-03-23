import Command from 'elementor-api/modules/command';

export default class Base extends Command {
	initialize( args ) {
		super.initialize( args );

		const { document = elementor.documents.getCurrent() } = args;

		this.document = document;
	}
}
