import Base from '../../../commands/base';

// Remove.
export default class extends Base {
	static restore( historyItem, isRedo ) {
		const subItems = historyItem.collection;

		historyItem.get( 'containers' ).forEach( ( container ) => {
			const data = subItems.findWhere( { container } ).get( 'data' );

			if ( isRedo ) {
				$e.run( 'document/elements/repeater/remove', {
					container,
					name: data.name,
					index: data.index,
				} );
			} else {
				$e.run( 'document/elements/repeater/insert', {
					container,
					model: data.model,
					name: data.name,
					options: { at: data.index },
				} );
			}
		} );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgument( 'name', args );
		this.requireArgument( 'index', args );
	}

	getHistory( args ) {
		const { name, containers = [ args.container ] } = args;

		return {
			containers,
			type: 'remove',
			subTitle: elementor.translate( 'Item' ),
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
		const { name, containers = [ args.container ] } = args,
			index = null === args.index ? -1 : args.index,
			result = [];

		containers.forEach( ( container ) => {
			const collection = container.settings.get( name ),
				model = collection.at( index );

			if ( elementor.history.history.getActive() ) {
				$e.run( 'document/history/addSubItem', {
					container, // TODO: Find better way.
					data: { name, model, index },
				} );
			}

			collection.remove( model );
			result.push( model );

			if ( this.isHistoryActive() ) {
				$e.run( 'document/elements/repeater/active', {
					container,
					index: collection.length === index ? index : collection.length,
				} );
			}

			container.view.renderOnChange( container.settings );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
