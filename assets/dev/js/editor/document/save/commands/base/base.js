import CommandHookable from 'elementor-api/modules/command-hookable';

export default class Base extends CommandHookable {
	initialize( args ) {
		super.initialize( args );

		const { document = elementor.documents.getCurrent() } = args;

		this.document = document;
	}
}
