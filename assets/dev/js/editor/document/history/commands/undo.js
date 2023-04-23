export class Undo extends $e.modules.CommandBase {
	apply() {
		elementor.documents.getCurrent().history.navigate();
	}
}

export default Undo;
