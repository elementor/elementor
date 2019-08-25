import Base from './base';

// כMove.
export default class extends Base {
	getHistory( args ) {
		// TODO: Move command to new syntax.
		return false;
	}

	apply() {
		const { args } = this;

		if ( ! args.target ) {
			throw Error( 'target is required.' );
		}

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		const options = args.options || {},
			elements = args.element ? [ args.element ] : args.elements,
			historyId = $e.run( 'document/history/startLog', {
				elements,
				type: 'move',
				returnValue: true,
			} );

		const reCreate = [];

		elements.forEach( ( element ) => {
			reCreate.push( elementorCommon.helpers.cloneObject( element.model ) );

			$e.run( 'document/elements/delete', { element } );
		} );

		reCreate.forEach( ( model ) => {
			$e.run( 'document/elements/create', {
				element: args.target,
				model,
				options,
				returnValue: true,
			} );
		} );

		$e.run( 'document/history/endLog', { id: historyId } );
	}
}
