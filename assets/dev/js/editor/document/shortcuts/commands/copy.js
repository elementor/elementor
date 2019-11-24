import Base from '../../commands/base/base';

export class Copy extends Base {
	apply( args ) {
		const selectedElement = elementor.getCurrentElement();

		if ( selectedElement ) {
			return $e.run( 'document/elements/copy', {
				container: selectedElement.getContainer(),
			} );
		}

		return false;
	}
}

export default Copy;
