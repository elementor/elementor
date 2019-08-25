import Base from '../commands/base';

// Insert.
export default class extends Base {
	static restore( historyItem, isRedo ) {
		if ( isRedo ) {
			const data = historyItem.get( 'data' );

			$e.run( 'document/elements/repeater/insert', {
				elements: historyItem.get( 'elements' ),
				model: data.model,
				name: data.name,
				options: { at: data.index },
			} );
		} else {
			const data = historyItem.get( 'data' );

			$e.run( 'document/elements/repeater/remove', {
				elements: historyItem.get( 'elements' ),
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
			subTitle: name,
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
