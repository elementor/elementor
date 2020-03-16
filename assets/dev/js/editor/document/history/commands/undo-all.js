import CommandHookable from 'elementor-api/modules/command-hookable';

export class UndoAll extends CommandHookable {
	apply( args ) {
		const { document } = args;

		document.history.doItem( document.history.getItems().length - 1 );
	}
}

export default UndoAll;
