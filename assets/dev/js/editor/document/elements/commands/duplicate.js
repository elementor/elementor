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
		const { elements = [ args.element ] } = args;

		elements.forEach( ( element ) => {
			const parent = element._parent,
				at = element._index + 1;

			$e.run( 'document/elements/create', {
				element: parent,
				model: element.model.clone(),
				options: { at },
			} );
		} );
	}
}
