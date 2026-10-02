import { getByPath } from './data-flow-bindings';

const PARENT_BINDING_PATTERN = /^\{\{\s*state\.([\w.]+)\s*\}\}$/;

function isPlainObject( value ) {
	return !! value && 'object' === typeof value && ! Array.isArray( value );
}

export function parseStaticState( raw ) {
	if ( isPlainObject( raw ) ) {
		return raw;
	}

	try {
		const parsed = JSON.parse( raw );

		return isPlainObject( parsed ) ? parsed : {};
	} catch {
		return {};
	}
}

function resolveDefault( value, lookupState ) {
	const match = 'string' === typeof value ? value.match( PARENT_BINDING_PATTERN ) : null;

	return match ? getByPath( lookupState, match[ 1 ] ) : value;
}

function resolveParams( params, parentState ) {
	return params.reduce( ( state, param ) => {
		if ( ! param?.key ) {
			return state;
		}

		return { ...state, [ param.key ]: resolveDefault( param.default, { ...parentState, ...state } ) };
	}, {} );
}

function applyInstanceValues( params, values = {} ) {
	return params.map( ( param ) =>
		Object.prototype.hasOwnProperty.call( values, param.key ) ? { ...param, default: values[ param.key ] } : param,
	);
}

// A component root's params are the component's params, which the instance scope already opened with its own values.
export function resolveScopeChain( chain, pageState ) {
	let state = { ...pageState };
	let isComponentRoot = false;

	chain.forEach( ( entry ) => {
		if ( entry.componentParams ) {
			state = { ...state, ...resolveParams( applyInstanceValues( entry.componentParams, entry.state ), state ) };
			isComponentRoot = true;

			return;
		}

		if ( ! isComponentRoot && entry.stateParams?.length ) {
			state = { ...state, ...resolveParams( entry.stateParams, state ) };
		}

		isComponentRoot = false;
	} );

	return state;
}
