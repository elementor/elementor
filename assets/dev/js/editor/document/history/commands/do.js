import CommandHookable from 'elementor-api/modules/command-hookable';

export class Do extends CommandHookable {
	apply( args ) {
		const { index } = args;

		return elementor.documents.getCurrent().history.doItem( index );
	}
}

export default Do;
