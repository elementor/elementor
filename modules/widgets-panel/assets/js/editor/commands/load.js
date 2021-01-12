import CommandBase from 'elementor-api/modules/command-base';

export class Load extends CommandBase {
	async apply( args = {} ) {
		const result = await $e.data.get( `panel-favorites/favorites`, {}, { refresh: true } );
		if ( result.data ) {
			for ( const widget in result.data ) {
				if ( widget ) {
					// Get the categories of widget from front-end
					const widgetsArr = elementor.widgetsCache[ widget ]?.categories;
					if ( widgetsArr ) {
						// Get element position in array
						const elmPos = widgetsArr.indexOf( 'favorites' );
						// Check - if element in array do nothing, else add it to array
						if ( -1 === elmPos ) {
							widgetsArr.push( 'favorites' );
						} else {
							widgetsArr.splice( elmPos, 1 );
						}
						$e.route( 'panel/elements/categories', { refresh: true } );
					}
				}
			}
		}

		return result;
	}
}
