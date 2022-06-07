export class Close extends $e.modules.CommandBase {
	apply() {
		// elementor.changeEditMode( 'preview' );
		elementor.panel.close();
	}
}

export default Close;
