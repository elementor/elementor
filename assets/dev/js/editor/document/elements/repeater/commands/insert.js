import Base from '../../commands/base';

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

		this.requireArgument( 'name', args );
		this.requireArgument( 'model', args );
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
			history: {
				behavior: {
					restore: this.constructor.restore,
				},
			},
		};
	}

	isDataChanged() {
		return true;
	}

	apply( args ) {
		const { model, name, options = { at: null }, containers = [ args.container ] } = args,
			result = [];

		containers.forEach( ( container ) => {
			const collection = container.settings.get( name ),
				itemModel = collection.push( model, options );

			result.push( itemModel );

			container.view.renderOnChange( container.settings );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
