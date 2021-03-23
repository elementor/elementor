import Command from 'elementor-api/modules/command';

export class UndoAll extends Command {
	apply( args ) {
		const { document } = args;

		document.history.doItem( document.history.getItems().length - 1 );
	}
}

export default UndoAll;
