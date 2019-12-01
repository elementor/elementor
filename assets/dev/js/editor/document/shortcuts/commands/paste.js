import Base from '../../commands/base/base';

export class Paste extends Base {
	apply( args ) {
		const selectedElement = elementor.getCurrentElement();

		if ( selectedElement ) {
			let selectedContainer = selectedElement.getContainer();

			const storage = elementorCommon.storage.get( 'clipboard' );

			if ( ! storage[ 0 ] ) {
				return false;
			}

			const options = {};

			switch ( selectedContainer.model.get( 'elType' ) ) {
				case 'section':
					options.at = elementor.elements.findIndex( selectedContainer.model );
				case 'widget':
				case 'column':
					selectedContainer = selectedContainer.parent;
					break;
			}

			return $e.run( 'document/elements/paste', {
				container: selectedContainer,
				options,
			} );
		}

		return false;
	}
}

export default Paste;
