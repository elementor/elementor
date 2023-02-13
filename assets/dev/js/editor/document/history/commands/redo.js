export class Redo extends $e.modules.CommandBase {
	apply() {
		elementor.documents.getCurrent().history.navigate( true );
	}
}

export default Redo;
