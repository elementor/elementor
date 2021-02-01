import CommandBase from 'elementor-api/modules/command-base';

export class Add extends CommandBase {
	async apply( args = {} ) {
		const widget = args.widget ?? '';

		if ( ! widget.length ) {
			return false;
		}

		const result = await $e.data.create( `panel-favorites/favorites?id=${ widget }`, {} );
		if ( result.data ) {
			// Get the categories of widget from front-end
			const widgetsArr = elementor.widgetsCache[ `${ widget }` ];
			if ( widgetsArr ) {
				/* @TODO: This line for 'inner-section' - need to fix it when get answer about it */
				if ( ! widgetsArr.hasOwnProperty( 'categories' ) ) {
					widgetsArr.categories = [];
				}
				// Get element position in array
				const elmExistsInArr = widgetsArr.categories.includes( 'favorites' );
				// Check - if element not exists in array - add it to array
				if ( ! elmExistsInArr ) {
					widgetsArr.categories.push( 'favorites' );
					$e.route( 'panel/elements/categories', { refresh: true } );
				}
			}
		}

		return result;
	}
}
