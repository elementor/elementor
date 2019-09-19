import Base from '../../../commands/base';

// Remove.
export default class extends Base {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' ),
			container = historyItem.get( 'container' );

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
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentType( 'name', 'string', args );
		this.requireArgument( 'index', args ); // sometimes null.
	}

	getHistory( args ) {
		const { name, containers = [ args.container ] } = args;

		return {
			containers,
			type: 'remove',
			subTitle: elementor.translate( 'Item' ),
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
					restore: this.constructor.restore,
				} );
			}

			collection.remove( model );
			result.push( model );

			container.render();
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
