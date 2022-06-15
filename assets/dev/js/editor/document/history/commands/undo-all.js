export class UndoAll extends $e.modules.CommandBase {
	apply( args ) {
		const { document } = args;

		document.history.doItem( document.history.getItems().length - 1 );
	}
}

export default UndoAll;
