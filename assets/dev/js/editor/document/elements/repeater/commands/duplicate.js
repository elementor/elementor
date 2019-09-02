import Base from '../../commands/base';

// Duplicate
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );

		this.requireArgument( 'index', args );
		this.requireArgument( 'name', args );
	}

	getHistory( args ) {
		// History handled by insert.
		return false;
	}

	apply( args ) {
		const { index, name, options = {}, elements = [ args.element ] } = args,
			result = [];

		elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' ),
				controlName = element.model.get( 'widgetType' ),
				collection = settingsModel.get( name ),
				item = collection.at( index );

			result.push( $e.run( 'document/elements/repeater/insert', {
				element,
				name,
				model: item.toJSON(),
				returnValue: true,
				options: Object.assign( {
					at: index + 1,
				}, options ),
			} ) );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
