import After from 'elementor-api/modules/hooks/data/after';

export class AddGlobalData extends After {
	getCommand() {
		return 'document/elements/index';
	}

	getConditions( args, result ) {
		if ( result.data.elType !== 'widget' ) {
			return;
		}

		result.data.settings.__globals__ = {
			typography_typography: 'globals/typography/primary',
			title_color: 'globals/colors/secondary',
		};

		return !! result?.data?.settings?.__globals__;
	}

	getId() {
		return 'add-global-data';
	}

	apply( args, result ) {
		const element = result.data;

		return Object.entries( element.settings.__globals__ ).map( async ( [ key, endpoint ] ) => {
			// Get global item.
			const itemResult = await $e.data.get( endpoint ),
				data = itemResult.data,
				container = elementor.getContainer( args.element_id ),
				groupPrefix = container.controls[ key ]?.groupPrefix;

			// it's a global settings with additional controls in group.
			if ( groupPrefix ) {
				Object.values( container.controls ).map( ( control ) => {
					if ( control.groupPrefix === groupPrefix ) {
						// The controls name (like `typography_font_family) is not equal to the global data control name (like `font_family`), duo to it's group prefix, like <typography_>font_family.
						const baseName = control.name.replace( control.groupPrefix, '' );
						if ( data[ baseName ] ) {
							element.settings[ control.name ] = data[ baseName ];
						}
					}
				} );
			} else {
				element.settings[ key ] = data;
			}
		} );
	}
}

export default AddGlobalData;
