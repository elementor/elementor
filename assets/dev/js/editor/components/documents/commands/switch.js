export class Switch extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	async apply( args ) {
		const { id, mode, onClose, shouldScroll = true, setAsInitial = false } = args;

		if ( ! elementor.documents.getCurrent().$element && elementor.config.document.panel.has_elements ) {
			await new Promise( ( resolve ) => {
				elementor.on( 'document:loaded', () => {
					return resolve();
				} );
			} );
		}

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
				return $e.run( 'editor/documents/open', { id, shouldScroll, selector: args.selector, setAsInitial } );
			} )
			.then( () => {
				elementor.getPanelView().getPages( 'menu' ).view.addExitItem();
			} );
	}
}

export default Switch;
