export class DeselectAll extends $e.modules.CommandBase {
	apply( args ) {
		elementor.selection.remove( [], { all: true } );
	}
}

export default DeselectAll;
