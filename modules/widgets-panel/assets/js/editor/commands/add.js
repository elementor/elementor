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
			const widgets = elementor.widgetsCache[ `${ widget }` ];
			if ( widgets ) {
				if ( ! widgets.hasOwnProperty( 'categories' ) ) {
					widgets.categories = [];
				}
				// Get element position in array
				const elementExists = widgets.categories.includes( 'favorites' );
				// Check: if element not exists in array - add it to array
				if ( ! elementExists ) {
					widgets.categories.push( 'favorites' );
					$e.route( 'panel/elements/categories', { refresh: true } );
				}
			}
		}

		return result;
	}
}
