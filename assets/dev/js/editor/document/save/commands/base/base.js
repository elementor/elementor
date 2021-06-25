import CommandBase from 'elementor-api/modules/command-base';

export default class Base extends CommandBase {
	initialize( args ) {
		super.initialize( args );

		const { document = elementor.documents.getCurrent() } = args;

		this.document = document;
	}
}
