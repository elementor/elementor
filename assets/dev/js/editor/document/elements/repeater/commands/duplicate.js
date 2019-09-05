import Base from '../../../commands/base';

// Duplicate
export default class extends Base {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgument( 'index', args );
		this.requireArgument( 'name', args );
	}

	getHistory( args ) {
		// History handled by insert.
		return false;
	}

	apply( args ) {
		const { index, name, options = {}, containers = [ args.container ] } = args,
			result = [];

		containers.forEach( ( container ) => {
			const settingsModel = container.settings,
				controlName = container.model.get( 'widgetType' ),
				collection = settingsModel.get( name ),
				item = collection.at( index );

			result.push( $e.run( 'document/elements/repeater/insert', {
				container,
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
