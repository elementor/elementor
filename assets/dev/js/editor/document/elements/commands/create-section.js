import Base from './base';

// CreateSection.
export default class extends Base {
	apply() {
		const { args } = this,
			options = args.options || {},
			elements = [];

		if ( ! args.columns ) {
			args.columns = 1;
		}

		const historyId = $e.run( 'document/history/startLog', {
			type: 'add',
			title: elementor.translate( 'section' ),
			elementType: 'section',
			returnValue: true,
		} );

		for ( let loopIndex = 0; loopIndex < args.columns; loopIndex++ ) {
			elements.push( {
				id: elementor.helpers.getUniqueID(),
				elType: 'column',
				settings: {},
				elements: [],
			} );
		}

		const section = elementor.getPreviewView().addChildElement( { elements }, options );

		if ( args.structure ) {
			section.setStructure( args.structure );
		}

		section.getEditModel().trigger( 'request:edit' );

		$e.run( 'document/history/endLog', { id: historyId } );

		return section;
	}
}
