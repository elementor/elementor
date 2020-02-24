import CommandBase from 'elementor-api/modules/command-base';

export class Switch extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id, mode, onClose, source = 'command' } = args;

		return $e.run( 'editor/documents/close', {
			id: elementor.documents.getCurrentId(),
			mode,
			onClose,
			source,
		} )
		.then( () => {
			return $e.run( 'editor/documents/open', { id, source } );
		} );
	}
}

export default Switch;
