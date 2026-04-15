export class Redo extends $e.modules.CommandBase {
	apply() {
		const historyItem = elementor.documents.getCurrent().history.navigate( true );

		return { historyItemId: historyItem?.get( 'id' ) ?? null };
	}
}

export default Redo;
