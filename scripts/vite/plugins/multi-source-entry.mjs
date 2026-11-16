export const MULTI_SOURCE_ENTRY_ID = 'virtual:elementor-entry';

const RESOLVED_ID = '\0' + MULTI_SOURCE_ENTRY_ID;

/**
 * Concatenates several sources into one bundle, which Webpack expressed as an array entry.
 * Import order is preserved because later sources depend on side effects of earlier ones.
 */
export function multiSourceEntryPlugin( { sources } ) {
	return {
		name: 'elementor-multi-source-entry',
		resolveId( id ) {
			return MULTI_SOURCE_ENTRY_ID === id ? RESOLVED_ID : null;
		},
		load( id ) {
			if ( RESOLVED_ID !== id ) {
				return null;
			}

			return sources.map( ( source ) => `import ${ JSON.stringify( source ) };` ).join( '\n' );
		},
	};
}
