import Base from '../../commands/base/base';

export class Delete extends Base {
	apply( args ) {
		const selectedElement = elementor.getCurrentElement();

		if ( selectedElement ) {
			return $e.run( 'document/elements/delete', {
				container: selectedElement.getContainer(),
			} );
		}

		return false;
	}
}

export default Delete;
