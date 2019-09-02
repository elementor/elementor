import Base from '../../commands/base';

// Remove.
export default class extends Base {
	static restore( historyItem, isRedo ) {
		const subItems = historyItem.collection;

		historyItem.get( 'elements' ).forEach( ( element ) => {
			const data = subItems.findWhere( { element } ).get( 'data' );

			if ( isRedo ) {
				$e.run( 'document/elements/repeater/remove', {
					element,
					name: data.name,
					index: data.index,
				} );
			} else {
				$e.run( 'document/elements/repeater/insert', {
					element,
					model: data.model,
					name: data.name,
					options: { at: data.index },
				} );
			}
		} );
	}

	validateArgs( args ) {
		this.requireElements( args );

		this.requireArgument( 'name', args );
		this.requireArgument( 'index', args );
	}

	getHistory( args ) {
		const { name, elements = [ args.element ] } = args;

		return {
			elements: elements,
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
		const { name, elements = [ args.element ] } = args,
			index = null === args.index ? -1 : args.index,
			result = [];

		elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' ),
				collection = settingsModel.get( name ),
				model = collection.at( index );

			if ( elementor.history.history.getActive() ) {
				$e.run( 'document/history/addSubItem', {
					element, // TODO: Find better way.
					data: { name, model, index },
				} );
			}

			collection.remove( model );
			result.push( model );

			if ( this.isHistoryActive() ) {
				$e.run( 'document/elements/repeater/active', {
					element,
					index: collection.length === index ? index : collection.length,
				} );
			}

			element.renderOnChange( settingsModel );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
