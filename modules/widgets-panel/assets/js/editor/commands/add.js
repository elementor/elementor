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
			const widgetsArr = elementor.widgetsCache[ widget ].categories;
			// Get element position in array
			const elmPos = widgetsArr.indexOf( 'favorites' );
			// Check - if element in array do nothing, else add it to array
			if ( -1 === elmPos ) {
				widgetsArr.push( 'favorites' );
				$e.route( 'panel/elements/categories', { refresh: true } );
			}
		}

		return result;
	}
}
