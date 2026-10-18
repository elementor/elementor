import { toCssValue } from './data-flow-css-value';

const MAX_ENCODED_LENGTH = 10000;
const REJECTED = Symbol( 'rejected' );
const BOOLEAN_STRINGS = { true: true, false: false };

function coerceNumber( value ) {
	const number = 'string' === typeof value && '' !== value.trim() ? Number( value ) : value;

	return 'number' === typeof number && Number.isFinite( number ) ? number : REJECTED;
}

function coerceBoolean( value ) {
	if ( 'boolean' === typeof value ) {
		return value;
	}

	if ( 0 === value || 1 === value ) {
		return 1 === value;
	}

	return 'string' === typeof value && value.toLowerCase() in BOOLEAN_STRINGS ? BOOLEAN_STRINGS[ value.toLowerCase() ] : REJECTED;
}

function coerceString( value ) {
	return 'string' === typeof value || 'number' === typeof value ? String( value ) : REJECTED;
}

function coerceByCssRules( value, propType ) {
	return null === toCssValue( value, propType ) ? REJECTED : value;
}

function coerceObject( value ) {
	return value && 'object' === typeof value ? value : REJECTED;
}

function coerceByType( value, { prop_type: propType, options } ) {
	switch ( propType ) {
		case 'number':
			return coerceNumber( value );
		case 'boolean':
			return coerceBoolean( value );
		case 'string':
			return coerceString( value );
		case 'enum':
			return options?.includes( value ) ? value : REJECTED;
		case 'color':
		case 'size':
			return coerceByCssRules( value, propType );
		case 'image':
			return coerceObject( value );
		default:
			return value;
	}
}

function isWithinSizeLimit( value ) {
	return JSON.stringify( value )?.length <= MAX_ENCODED_LENGTH;
}

export function coerceStateValue( schemaEntry, value ) {
	if ( ! schemaEntry ) {
		return value;
	}

	const coerced = coerceByType( value, schemaEntry );

	return REJECTED === coerced || ! isWithinSizeLimit( coerced ) ? REJECTED : coerced;
}

export function isRejected( value ) {
	return REJECTED === value;
}
