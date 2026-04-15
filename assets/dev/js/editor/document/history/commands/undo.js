export class Undo extends $e.modules.CommandBase {
	apply() {
		const historyItem = elementor.documents.getCurrent().history.navigate();

		return { historyItemId: historyItem?.get( 'id' ) ?? null };
	}
}

export default Undo;
