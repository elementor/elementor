import Base from './base';

// Move.
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );
		this.requireArgument( 'target', args );
	}

	getHistory( args ) {
		const { elements = [ args.element ] } = args;

		return {
			elements,
			type: 'move',
		};
	}

	apply( args ) {
		const { target, options = {}, elements = [ args.element ] } = args,
			reCreate = [];

		elements.forEach( ( element ) => {
			reCreate.push( elementorCommon.helpers.cloneObject( element.model ) );

			$e.run( 'document/elements/delete', { element } );
		} );

		let count = 0;
		reCreate.forEach( ( model ) => {
			// If multiple fix position.
			if ( options.hasOwnProperty( 'at' ) && reCreate.length > 1 ) {
				if ( 0 !== count ) {
					options.at += count;
				}
			}

			$e.run( 'document/elements/create', {
				element: target,
				model,
				options,
				returnValue: true,
			} );

			count++;
		} );
	}
}
