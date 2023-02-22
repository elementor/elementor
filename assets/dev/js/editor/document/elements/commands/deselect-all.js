export class DeselectAll extends $e.modules.CommandBase {
	apply() {
		elementor.selection.remove( [], true );
	}
}

export default DeselectAll;
