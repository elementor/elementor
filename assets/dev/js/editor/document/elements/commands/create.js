import Base from './base';

// Create.
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );
		this.requireArgument( 'model', args );
	}

	getHistory( args ) {
		const { model, elements = [ args.element ] } = args;

		return {
			elements,
			model,
			type: 'add',
		};
	}

	apply( args ) {
		const { model, options = {}, elements = [ args.element ] } = args;

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

		return result;
	}
}
