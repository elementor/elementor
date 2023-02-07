export class SetTitle extends $e.modules.CommandBase {
	apply( args ) {
		elementor.getPanelView().getHeaderView().setTitle( args.title );
	}
}

export default SetTitle;
