import Base from '../../commands/base';

// Insert.
export default class extends Base {
	static restore( historyItem, isRedo ) {
		const elements = historyItem.get( 'elements' ),
			data = historyItem.get( 'data' );

		if ( isRedo ) {
			$e.run( 'document/elements/repeater/insert', {
				elements,
				model: data.model,
				name: data.name,
				options: { at: data.index },
			} );
		} else {
			$e.run( 'document/elements/repeater/remove', {
				elements,
				name: data.name,
				index: data.index,
			} );
		}
	}

	validateArgs( args ) {
		this.requireElements( args );

		this.requireArgument( 'name', args );
		this.requireArgument( 'model', args );
	}

	getHistory( args ) {
		const { model, name, options = { at: null }, elements = [ args.element ] } = args;

		return {
			elements,
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
		const { model, name, options = { at: null }, elements = [ args.element ] } = args,
			result = [];

		elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' ),
				collection = settingsModel.get( name );

			result.push( collection.push( model, options ) );

			if ( this.isHistoryActive() ) {
				$e.run( 'document/elements/repeater/active', {
					element,
					index: options.at ? ( options.at + 1 ) : collection.length,
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
