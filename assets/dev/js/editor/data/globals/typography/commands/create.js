import CreateBase from 'elementor-editor/data/globals/base/create-base';

export class Create extends CreateBase {
	apply( args = {} ) {
		const { container, setting, title } = args,
			controls = container.controls,
			availableControls = {};

		let result = false,
			groupPrefix = '';

		if ( controls[ setting ] && controls[ setting ].groupPrefix ) {
			groupPrefix = controls[ setting ].groupPrefix;
		} else {
			throw new Error( `Invalid setting: control '${ setting }', not found.` );
		}

		if ( groupPrefix ) {
			Object.entries( controls ).forEach( ( [ key ] ) => {
				if ( key.includes( groupPrefix ) ) {
					// Get values but remove defaults.
					const value = container.settings.get( key ),
						defaultValue = container.controls[ key ].default;

					if ( ! _.isEqual( value, defaultValue ) ) {
						availableControls[ key.replace( groupPrefix, elementor.config.kit_config.typography_prefix ) ] = container.settings.get( key );
					}
				}
			} );
		}

		if ( Object.values( availableControls ).length ) {
			const id = elementorCommon.helpers.getUniqueId();

			result = $e.data.create( `globals/typography?id=${ id }`, {
				title,
				value: availableControls,
			} );
		}

		return result;
	}
}
