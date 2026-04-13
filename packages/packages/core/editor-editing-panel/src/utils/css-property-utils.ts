/**
 * Read the value of a single CSS property from a raw CSS declarations string.
 * e.g. getCssPropertyValue( 'padding:10px;color:red;', 'color' ) → 'red'
 */
export function getCssPropertyValue( css: string, property: string ): string {
	const regex = new RegExp( `(?:^|;)\\s*${ escapeRegex( property ) }\\s*:\\s*([^;]+)`, 'i' );
	return css.match( regex )?.[ 1 ]?.trim() ?? '';
}

/**
 * Set (or remove) the value of a single CSS property in a raw CSS declarations string.
 * Passing an empty value removes the property entirely.
 * e.g. setCssPropertyValue( 'padding:10px;color:red;', 'color', 'blue' ) → 'padding:10px;color:blue;'
 */
export function setCssPropertyValue( css: string, property: string, value: string ): string {
	const regex = new RegExp( `((?:^|;)\\s*)${ escapeRegex( property ) }\\s*:[^;]*`, 'i' );

	if ( regex.test( css ) ) {
		if ( ! value ) {
			return css.replace( regex, '$1' ).replace( /;;+/g, ';' ).replace( /^;|;$/g, '' );
		}
		return css.replace( regex, `$1${ property }:${ value }` );
	}

	if ( ! value ) {
		return css;
	}

	const base = css.trimEnd().replace( /;$/, '' );
	return base ? `${ base };${ property }:${ value };` : `${ property }:${ value };`;
}

function escapeRegex( str: string ): string {
	return str.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}
