import { inferPropType, toCssValue, unwrap } from './data-flow-css-value';
import { ANY_KEY } from './data-flow-store';

export const STATE_CLASS_PREFIX = 'e--state-';
export const STATE_VARIABLE_PREFIX = '--e-state-';

const SCOPE_ATTRIBUTE = 'data-e-scope';
function readVariable( element, name ) {
	return element.style.getPropertyValue( name ) || element.ownerDocument.defaultView.getComputedStyle( element ).getPropertyValue( name ).trim();
}

export function applyStateKey( element, key, value, propType ) {
	element.classList.toggle( `${ STATE_CLASS_PREFIX }${ key }`, true === value );

	const name = `${ STATE_VARIABLE_PREFIX }${ key }`;
	const cssValue = toCssValue( value, propType ?? inferPropType( unwrap( value ) ) );

	if ( null === cssValue ) {
		element.style.removeProperty( name );

		return;
	}

	if ( readVariable( element, name ) !== cssValue ) {
		element.style.setProperty( name, cssValue );
	}
}

function bindElement( element, store, keys, schema ) {
	const apply = () => {
		const state = store.getState();

		keys.forEach( ( key ) => applyStateKey( element, key, state[ key ], schema?.[ key ]?.prop_type ) );
	};

	apply();

	return store.subscribe( ANY_KEY, apply );
}

function groupElementsByScope( doc ) {
	const groups = new Map();

	doc.querySelectorAll( `[${ SCOPE_ATTRIBUTE }]` ).forEach( ( element ) => {
		const id = element.getAttribute( SCOPE_ATTRIBUTE );

		groups.set( id, [ ...( groups.get( id ) ?? [] ), element ] );
	} );

	return groups;
}

export function bindVisualState( { doc, pageStore, scopeStores, scopes, pageSchema = {} } ) {
	const unsubscribers = [ bindElement( doc.body, pageStore, Object.keys( pageStore.getState() ), pageSchema ) ];
	const elementsByScope = groupElementsByScope( doc );

	scopes.forEach( ( { id, state, schema } ) => {
		( elementsByScope.get( id ) ?? [] ).forEach( ( element ) => {
			unsubscribers.push( bindElement( element, scopeStores.get( id ), Object.keys( state || {} ), schema ) );
		} );
	} );

	return () => unsubscribers.forEach( ( unsubscribe ) => unsubscribe() );
}
