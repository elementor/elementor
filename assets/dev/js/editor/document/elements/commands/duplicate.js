import Base from './base';

// Duplicate.
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );
	}

	getHistory( args ) {
		const { elements = [ args.element ] } = args;

		return {
			elements,
			type: 'duplicate', // TODO: add translation.
		};
	}

	apply( args ) {
		const { elements = [ args.element ] } = args,
			result = [];

		elements.forEach( ( element ) => {
			const parent = element._parent,
				at = element._index + 1;

			result.push( $e.run( 'document/elements/create', {
				element: parent,
				model: element.model,
				returnValue: true,
				options: {
					at,
					clone: true,
				},
			} ) );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
