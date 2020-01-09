import Base from '../document/commands/base/base';

export class Switch extends Base {
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
