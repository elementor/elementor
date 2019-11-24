import Base from '../../commands/base/base';

export class Duplicate extends Base {
	apply( args ) {
		const selectedElement = elementor.getCurrentElement();

		if ( selectedElement ) {
			return $e.run( 'document/elements/duplicate', {
				container: selectedElement.getContainer(),
			} );
		}

		return false;
	}
}

export default Duplicate;
