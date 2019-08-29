import Base from '../commands/base';

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

	getFlagEditorChange() {
		return true;
	}

	apply( args ) {
		const { model, name, options = { at: null }, elements = [ args.element ] } = args,
			result = [];

		elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' ),
				collection = settingsModel.get( name );

			result.push( collection.push( model, options ) );

			// TODO: not always needed (when history is active).
			element.renderOnChange( settingsModel );
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
