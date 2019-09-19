import Base from '../../../commands/base';

// Insert.
export default class extends Base {
	static restore( historyItem, isRedo ) {
		const containers = historyItem.get( 'containers' ),
			data = historyItem.get( 'data' );

		if ( isRedo ) {
			$e.run( 'document/elements/repeater/insert', {
				containers,
				model: data.model,
				name: data.name,
				options: { at: data.index },
			} );
		} else {
			$e.run( 'document/elements/repeater/remove', {
				containers,
				name: data.name,
				index: data.index,
			} );
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
			const collection = container.settings.get( name );

			collection.push( model, options );

			const childContainer = container.children[ container.children.length - 1 ];

			result.push( childContainer );

			container.render();
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
