import CommandBase from 'elementor-api/modules/command-base';

export class UndoAll extends CommandBase {
	apply( args ) {
		const { document } = args;

		document.history.doItem( document.history.getItems().length - 1 );
	}
}

export default UndoAll;
