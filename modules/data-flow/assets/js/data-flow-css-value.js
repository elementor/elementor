const SIZE_UNITS = [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex', 'pt', 'cm', 'mm', 'in', 'fr', 'deg', 's', 'ms' ];
const COLOR_PATTERN = /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/-]+\)|[a-z]{3,20})$/i;
const IDENTIFIER_PATTERN = /^[\w-]{1,64}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9 _.-]{1,64}$/;

export function unwrap( value ) {
	return value && 'object' === typeof value && '$$type' in value ? value.value : value;
}

export function inferPropType( value ) {
	if ( 'boolean' === typeof value ) {
		return 'boolean';
	}

	if ( 'number' === typeof value ) {
		return 'number';
	}

	return 'string' === typeof value ? 'string' : 'json';
}

function toNumber( value ) {
	return 'number' === typeof value && Number.isFinite( value ) ? String( value ) : null;
}

function toSize( value ) {
	const size = toNumber( value?.size );

	return null !== size && SIZE_UNITS.includes( value.unit ) ? size + value.unit : null;
}

export function toCssValue( rawValue, propType ) {
	const value = unwrap( rawValue );

	switch ( propType ) {
		case 'number':
			return toNumber( value );
		case 'size':
			return toSize( value );
		case 'color':
			return 'string' === typeof value && COLOR_PATTERN.test( value ) ? value : null;
		case 'enum':
			return 'string' === typeof value && IDENTIFIER_PATTERN.test( value ) ? value : null;
		case 'string':
			return 'string' === typeof value && TOKEN_PATTERN.test( value ) ? value : null;
		default:
			return null;
	}
}
