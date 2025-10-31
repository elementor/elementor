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

		const currentDocument = elementor.documents.getCurrent();

		const closePromise = currentDocument
			? $e.run( 'editor/documents/close', {
				id: currentDocument.id,
				mode,
				onClose,
				selector: args.selector,
			} )
			: Promise.resolve();

		return closePromise
			.then( () => {
				return $e.run( 'editor/documents/open', { id, shouldScroll, shouldNavigateToDefaultRoute, selector: args.selector, setAsInitial } );
			} )
			.then( () => {
				elementor.getPanelView().getPages( 'menu' ).view.addExitItem();
			} );
	}
}

export default Switch;
