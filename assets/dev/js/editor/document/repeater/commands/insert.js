import History from '../../commands/base/history';

export class Insert extends History {
	static restore( historyItem, isRedo ) {
		const containers = historyItem.get( 'containers' ),
			data = historyItem.get( 'data' );

		if ( isRedo ) {
			$e.run( 'document/repeater/insert', {
				containers,
				model: data.model,
				name: data.name,
				options: { at: data.index },
			} );
		} else {
			$e.run( 'document/repeater/remove', {
				containers,
				name: data.name,
				index: data.index,
			} );
		}
	}

	initialize( args ) {
		super.initialize( args );

		if ( ! args.model._id ) {
			args.model._id = elementor.helpers.getUniqueID();
		}
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentType( 'model', 'object', args );

		this.requireArgumentConstructor( 'name', String, args );
	}

	getHistory( args ) {
		const { model, name, options = { at: null }, containers = [ args.container ] } = args;

		return {
			containers,
			type: 'add',
			subTitle: elementor.translate( 'Item' ),
			data: {
				model,
				name,
				index: options.at,
			},
			restore: this.constructor.restore,
		};
	}

	isDataChanged() {
		return true;
	}

	apply( args ) {
		const { model, name, options = { at: null }, containers = [ args.container ] } = args,
			result = [];

		containers.forEach( ( container ) => {
			container = container.lookup();

			const collection = container.settings.get( name );

			result.push( collection.push( model, options ) );

			container.render();
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}

export default Insert;
