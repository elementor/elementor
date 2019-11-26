import Base from '../../commands/base/base';

export class Paste extends Base {
	apply( args ) {
		const selectedElement = elementor.getCurrentElement();

		if ( selectedElement ) {
			const options = {};

			let container = selectedElement.getContainer();

			switch ( container.model.get( 'elType' ) ) {
				case 'section':
					options.at = elementor.elements.findIndex( container.model );
				case 'widget':
				case 'column':
					container = container.parent;
					break;
			}

			return $e.run( 'document/elements/paste', {
				container,
				options,
			} );
		}

		return false;
	}
}

export default Paste;
