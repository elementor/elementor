const RESERVED_SETTING_KEYS = new Set( [ '__globals__', '__dynamic__' ] );
const REPEATER_ROW_ID_KEY = '_id';
const FONT_FAMILY_KEY_PATTERN = /font_family/;

export type HardcodedFont = {
	path: string;
	value: string;
};

function isGlobalFontReference( value: string ): boolean {
	return value.startsWith( 'globals/' );
}

function isHardcodedFontCandidate( key: string, value: string ): boolean {
	return FONT_FAMILY_KEY_PATTERN.test( key ) && value.trim().length > 0;
}

function formatPath( prefix: string, key: string ): string {
	return prefix ? `${ prefix }.${ key }` : key;
}

function formatArrayPath( prefix: string, index: number ): string {
	return `${ prefix }[${ index }]`;
}

export function collectHardcodedFonts( settings: Record< string, unknown >, pathPrefix = '' ): HardcodedFont[] {
	const linkedGlobals = ( settings.__globals__ ?? {} ) as Record< string, string >;
	const results: HardcodedFont[] = [];

	for ( const [ key, value ] of Object.entries( settings ) ) {
		if ( RESERVED_SETTING_KEYS.has( key ) || key === REPEATER_ROW_ID_KEY ) {
			continue;
		}

		if ( linkedGlobals[ key ] ) {
			continue;
		}

		if ( typeof value === 'string' ) {
			if ( ! isGlobalFontReference( value ) && isHardcodedFontCandidate( key, value ) ) {
				results.push( { path: formatPath( pathPrefix, key ), value } );
			}
			continue;
		}

		if ( Array.isArray( value ) ) {
			const arrayPath = formatPath( pathPrefix, key );

			value.forEach( ( item, index ) => {
				if ( item && typeof item === 'object' && ! Array.isArray( item ) ) {
					results.push(
						...collectHardcodedFonts(
							item as Record< string, unknown >,
							formatArrayPath( arrayPath, index )
						)
					);
				}
			} );
			continue;
		}

		if ( value && typeof value === 'object' ) {
			results.push(
				...collectHardcodedFonts( value as Record< string, unknown >, formatPath( pathPrefix, key ) )
			);
		}
	}

	return results;
}
