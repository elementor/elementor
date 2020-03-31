import After from 'elementor-api/modules/hooks/data/after';

export class ElementsIndexAddGlobalData extends After {
	getCommand() {
		return 'document/elements/index';
	}

	getConditions( args, result ) {
		return ! elementorCommonConfig.isTesting && 'get' === args.query.type && result?.data?.settings?.__globals__;
	}

	getId() {
		return 'document/elements/index::add-global-data';
	}

	apply( args, result ) {
		const element = result.data;

		return Object.entries( element.settings.__globals__ ).map( async ( [ key, endpoint ] ) => {
			// Get global item.
			const itemResult = await $e.data.get( endpoint, {}, { cache: true } ),
				data = itemResult.data,
				container = elementor.getContainer( args.query.element_id ),
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

export default ElementsIndexAddGlobalData;
