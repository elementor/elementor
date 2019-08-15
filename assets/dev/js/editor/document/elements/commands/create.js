import Base from './base';

// Create.
export default class extends Base {
	apply() {
		const { args } = this,
			options = args.options || {},
			data = args.data || {};

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		const elements = args.elements || [ args.element ];

		if ( ! options.hasOwnProperty( 'trigger' ) || true === options.trigger ) {
			options.trigger = {
				beforeAdd: 'element:before:add',
				afterAdd: 'element:after:add',
			};
		}

		let result = [];

		elements.forEach( ( element ) => {
			const createdElement = element.addChildElement( data, options );

			result.push( createdElement );

			if ( 'column' === createdElement.model.get( 'elType' ) ) {
				createdElement._parent.resetLayout();
			}
		} );

		if ( 1 === result.length ) {
			result = result[ 0 ];
		}

		return result;
	}
}
