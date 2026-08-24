const RESERVED_SETTING_KEYS = new Set( [ '__globals__', '__dynamic__' ] );
const REPEATER_ROW_ID_KEY = '_id';

const HEX_COLOR_PATTERN = /^#[0-9a-f]{3,8}$/i;
const RGB_COLOR_PATTERN = /^rgba?\(/i;

export type HardcodedColor = {
	path: string;
	value: string;
};

function isGlobalColorReference( value: string ): boolean {
	return value.startsWith( 'globals/' );
}

function isHardcodedColorCandidate( value: string ): boolean {
	const trimmed = value.trim();

	return HEX_COLOR_PATTERN.test( trimmed ) || RGB_COLOR_PATTERN.test( trimmed );
}

function formatPath( prefix: string, key: string ): string {
	return prefix ? `${ prefix }.${ key }` : key;
}

function formatArrayPath( prefix: string, index: number ): string {
	return `${ prefix }[${ index }]`;
}

export function collectHardcodedColors( settings: Record< string, unknown >, pathPrefix = '' ): HardcodedColor[] {
	const linkedGlobals = ( settings.__globals__ ?? {} ) as Record< string, string >;
	const results: HardcodedColor[] = [];

	for ( const [ key, value ] of Object.entries( settings ) ) {
		if ( RESERVED_SETTING_KEYS.has( key ) || key === REPEATER_ROW_ID_KEY ) {
			continue;
		}

		if ( linkedGlobals[ key ] ) {
			continue;
		}

		if ( typeof value === 'string' ) {
			if ( ! isGlobalColorReference( value ) && isHardcodedColorCandidate( value ) ) {
				results.push( { path: formatPath( pathPrefix, key ), value } );
			}
			continue;
		}

		if ( Array.isArray( value ) ) {
			const arrayPath = formatPath( pathPrefix, key );

			value.forEach( ( item, index ) => {
				if ( item && typeof item === 'object' && ! Array.isArray( item ) ) {
					results.push(
						...collectHardcodedColors(
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
				...collectHardcodedColors( value as Record< string, unknown >, formatPath( pathPrefix, key ) )
			);
		}
	}

	return results;
}
