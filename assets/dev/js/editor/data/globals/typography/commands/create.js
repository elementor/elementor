import CreateBase from 'elementor-editor/data/globals/base/create-base';

export class Create extends CreateBase {
	apply( args = {} ) {
		const { container, setting, title } = args,
			controls = container.controls,
			availableControls = {};

		let	result = false,
			groupPrefix = '';

		if ( controls[ setting ] && controls[ setting ].groupPrefix ) {
			groupPrefix = controls[ setting ].groupPrefix;
		} else {
			throw new Error( `Invalid setting: control '${ setting }', not found.` );
		}

		if ( groupPrefix ) {
			Object.entries( controls ).forEach( ( [ key ] ) => {
				if ( key.includes( groupPrefix ) ) {
					availableControls[ key.replace( groupPrefix, '' ) ] = container.settings.get( key );
				}
			} );
		}

		if ( Object.values( availableControls ).length ) {
			const id = elementor.helpers.getUniqueID();

			// Currently does not effect cache.
			result = $e.data.create( `globals/typography?id=${ id }`, {
				title,
				value: availableControls,
			} );
		}

		return result;
	}
}
