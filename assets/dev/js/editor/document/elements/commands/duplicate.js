import Base from './base';

// Duplicate.
export default class extends Base {
	getHistory( args ) {
		// TODO: Move command to new syntax.
		return false;
	}

	apply() {
		const { args } = this;

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		if ( ! args.elements ) {
			args.elements = [ args.element ];
		}

		const historyId = $e.run( 'document/history/startLog', {
			elements: args.elements,
			type: 'duplicate', // TODO: add translation.
			returnValue: true,
		} );

		args.elements.forEach( ( element ) => {
			const parent = element._parent,
				at = element._index + 1;

			$e.run( 'document/elements/create', {
				element: parent,
				model: element.model.clone(),
				options: { at },
			} );
		} );

		$e.run( 'document/history/endLog', { id: historyId } );
	}
}
