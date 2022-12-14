export class DeselectAll extends $e.modules.CommandBase {
	apply( args ) {
		elementor.selection.remove( [], true, { panelOpenDefault: ( args.panelOpenDefault ?? true ) } );
	}
}

export default DeselectAll;
