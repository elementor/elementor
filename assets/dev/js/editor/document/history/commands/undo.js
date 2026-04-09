export class Undo extends $e.modules.CommandBase {
	apply() {
		return elementor.documents.getCurrent().history.navigate();
	}
}

export default Undo;
