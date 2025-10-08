export class Switch extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id, mode, onClose, shouldScroll = true, shouldNavigateToDefaultRoute = true, setAsInitial = false } = args;

		if ( setAsInitial ) {
			// Will be removed by the attach-preview after the iframe has loaded.
			jQuery( '#elementor-preview-loading' ).show();
		}

		return $e.run( 'editor/documents/close', {
			id: elementor.documents.getCurrentId(),
			mode,
			onClose,
			selector: args.selector,
		} )
			.then( () => {
				return $e.run( 'editor/documents/open', { id, shouldScroll, shouldNavigateToDefaultRoute, selector: args.selector, setAsInitial } );
			} )
			.then( () => {
				elementor.getPanelView().getPages( 'menu' ).view.addExitItem();
			} );
	}
}

export default Switch;
