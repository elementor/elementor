import Base from '../commands/base';

// Duplicate
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );

		this.requireArgument( 'index', args );
		this.requireArgument( 'name', args );
	}

	getHistory( args ) {
		// History handled by insert.
		return false;
	}

	apply( args ) {
		const { index, name, options = {}, elements = [ args.element ] } = args;

		elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' ),
				controlName = element.model.get( 'widgetType' ),
				collection = settingsModel.get( controlName ),
				item = collection.at( index );

			$e.run( 'document/elements/repeater/insert', {
				elements,
				name,
				model: item.toJSON(),
				options: Object.assign( {
					at: index + 1,
				}, options ),
			} );
		} );
	}
}
