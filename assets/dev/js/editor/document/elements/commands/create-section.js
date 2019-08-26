import Base from './base';

// CreateSection.
export default class extends Base {
	getHistory( args ) {
		return {
			type: 'add',
			title: elementor.translate( 'section' ),
			elementType: 'section',
		};
	}

	apply( args ) {
		const { structure = false, columns = 1, options = {} } = args,
			elements = [];

		for ( let loopIndex = 0; loopIndex < columns; loopIndex++ ) {
			elements.push( {
				id: elementor.helpers.getUniqueID(),
				elType: 'column',
				settings: {},
				elements: [],
			} );
		}

		const eSection = $e.run( 'document/elements/create', {
			element: elementor.getPreviewView(),
			model: { elements },
			options,
			returnValue: true,
		} );

		if ( structure ) {
			eSection.setStructure( structure );
		}

		return eSection;
	}
}
