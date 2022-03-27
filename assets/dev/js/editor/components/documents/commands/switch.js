export class Switch extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id, mode, onClose } = args;

		return $e.run( 'editor/documents/close', {
			id: elementor.documents.getCurrentId(),
			mode,
			onClose,
		} )
		.then( () => {
			return $e.run( 'editor/documents/open', { id } );
		} )
		.then( () => {
			elementor.getPanelView().getPages( 'menu' ).view.addExitItem();
		} );
	}
}

export default Switch;
