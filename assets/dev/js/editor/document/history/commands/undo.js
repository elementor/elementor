export class Undo extends $e.modules.CommandBase {
	apply() {
		const historyItem = elementor.documents.getCurrent().history.navigate();

		// The history item that was just undone.
		return { originHistoryItemId: historyItem?.get( 'id' ) ?? null };
	}
}

export default Undo;
