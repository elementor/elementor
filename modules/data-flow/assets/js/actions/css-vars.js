export const CSS_VAR_PREFIX = '--e-state-';

const SAFE_STRING_VALUE = /^[\w#.%\s(),+-]*$/;
const MAX_STRING_LENGTH = 200;
const DECIMALS = 4;

export function toCssVarName( key ) {
	return CSS_VAR_PREFIX + key;
}

export function toCssValue( value ) {
	if ( 'number' === typeof value ) {
		return Number.isFinite( value ) ? String( Number( value.toFixed( DECIMALS ) ) ) : null;
	}

	if ( 'boolean' === typeof value ) {
		return value ? '1' : '0';
	}

	if ( 'string' === typeof value && value.length <= MAX_STRING_LENGTH && SAFE_STRING_VALUE.test( value ) ) {
		return value;
	}

	return null;
}

function writeVar( element, key, value ) {
	const cssValue = toCssValue( value );

	if ( null === cssValue ) {
		element.style.removeProperty( toCssVarName( key ) );
		return;
	}

	element.style.setProperty( toCssVarName( key ), cssValue );
}

/**
 * Mirrors the keys a store owns as `--e-state-<key>` custom properties on the element, so styles read state
 * through `var()` and inherit it down the tree like any CSS variable.
 */
export function bindCssVars( element, store ) {
	const state = store.getState();

	Object.keys( state ).filter( store.owns ).forEach( ( key ) => writeVar( element, key, state[ key ] ) );

	return store.subscribe( '*', ( value, key ) => {
		if ( store.owns( key ) ) {
			writeVar( element, key, value );
		}
	} );
}
