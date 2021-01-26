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
			if ( undefined !== typeof widgetsArr ) {
				if ( widgetsArr.hasOwnProperty( 'categories' ) ) {
					widgetsArr.categories = [];
				}
				// Check - if element in array do nothing, else add it to array
				if ( widgetsArr.includes( 'favorites' ) ) {
					widgetsArr.push( 'favorites' );
					$e.route( 'panel/elements/categories', { refresh: true } );
				}
			}
		}

		return result;
	}
}
