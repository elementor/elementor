import Base from './base';

// Create.
export default class extends Base {
	apply() {
		const { args } = this;

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		if ( ! args.model ) {
			throw Error( 'model is required.' );
		}

		const options = args.options || {},
			model = args.model,
			elements = args.elements || [ args.element ];

		let historyId = null;

		if ( elementor.history.history.getActive() ) {
			historyId = $e.run( 'document/history/startLog', {
				elements,
				model,
				type: 'add',
				returnValue: true,
			} );
		}

		let result = [];

		elements.forEach( ( element ) => {
			const createdElement = element.addChildElement( model, options );

			result.push( createdElement );

			if ( 'column' === createdElement.model.get( 'elType' ) ) {
				createdElement._parent.resetLayout();
			}
		} );

		if ( 1 === result.length ) {
			result = result[ 0 ];
		}

		if ( historyId ) {
			$e.run( 'document/history/endLog', { id: historyId } );
		}

		return result;
	}
}
