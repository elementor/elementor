import CommandBase from 'elementor-api/modules/command-base';

export class Switch extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id } = args;

		$e.run( 'editor/documents/close', {
			id: elementor.documents.getCurrentId(),
			onClose: () => {
				$e.run( 'editor/documents/open', { id } );
			},
		} );
	}
}

export default Switch;
