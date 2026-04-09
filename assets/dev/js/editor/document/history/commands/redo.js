export class Redo extends $e.modules.CommandBase {
	apply() {
		return elementor.documents.getCurrent().history.navigate( true );
	}
}

export default Redo;
