import History from '../../../commands/base/history';

export class Duplicate extends History {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentType( 'name', 'string', args );
		this.requireArgumentType( 'index', 'number', args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'duplicate',
			subTitle: elementor.translate( 'Item' ),
		};
	}

	apply( args ) {
		const { index, name, options = {}, containers = [ args.container ] } = args,
			result = [];

		containers.forEach( ( container ) => {
			const settingsModel = container.settings,
				collection = settingsModel.get( name ),
				item = collection.at( index );

			result.push( $e.run( 'document/elements/repeater/insert', {
				container,
				name,
				model: item.toJSON(),
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

export default Duplicate;
