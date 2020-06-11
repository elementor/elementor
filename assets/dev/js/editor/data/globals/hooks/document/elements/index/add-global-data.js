import After from 'elementor-api/modules/hooks/data/after';

export class ElementsIndexAddGlobalData extends After {
	getCommand() {
		return 'editor/documents/elements';
	}

	getConditions( args, result ) {
		// TODO: Remove - Create testing compatibility.
		// TODO: Extend Hooks Create hooks for data, and add getType ( get, post, etc ).
		return ! elementorCommonConfig.isTesting && 'get' === args.options.type && result?.data?.settings?.__globals__;
	}

	getId() {
		return 'editor/documents/elements::add-global-data';
	}

	apply( args, result ) {
		const element = result.data;
		return Object.entries( element.settings.__globals__ ).map( async ( [ globalKey, globalValue ] ) => {
			// Means, the control default value were disabled.
			if ( ! globalValue ) {
				return;
			}
			// Get global item.
			const container = elementor.getContainer( args.query.elementId ),
				controlGroupPrefix = container.controls[ globalKey ]?.groupPrefix,
				groupType = container.controls[ globalKey ]?.groupType,
				localArgs = {};

			$e.data.commandExtractArgs( globalValue, localArgs );

			const id = localArgs.query.id;

			// it's a global settings with additional controls in group.
			if ( controlGroupPrefix ) {
				Object.values( container.controls ).map( ( control ) => {
					if ( control.groupPrefix === controlGroupPrefix ) {
						const baseName = control.name.replace( control.groupPrefix, '' );
						element.settings[ control.name ] = `var( --e-global-${ groupType }-${ id }-${ baseName.replace( '_', '-' ) } )`;
					}
				} );
			} else {
				const type = container.controls[ globalKey ].type;
				element.settings[ globalKey ] = `var( --e-global-${ type }-${ id } )`;
			}
		} );
	}
}
export default ElementsIndexAddGlobalData;

