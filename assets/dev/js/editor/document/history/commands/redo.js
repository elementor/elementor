export class Redo extends $e.modules.CommandBase {
	apply() {
		const historyItem = elementor.documents.getCurrent().history.navigate( true );

		// The history item that was just redone.
		return { originHistoryItemId: historyItem?.get( 'id' ) ?? null };
	}
}

export default Redo;
