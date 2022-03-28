export class DeselectAll extends $e.modules.CommandBase {
	apply( args ) {
		elementor.selection.remove( [], true );
	}
}

export default DeselectAll;
