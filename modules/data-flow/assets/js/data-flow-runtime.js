import { createActionRegistry } from './actions/action-registry';
import { attachActions } from './actions/attach-actions';
import { bindCssVars } from './actions/css-vars';
import { createFrameLoop } from './actions/frame-loop';
import { bindTextNodes } from './data-flow-bindings';
import { createScopedStore, createStore } from './data-flow-store';

export const DATA_SCRIPT_ID = 'elementor-data-flow-data';
export const SCOPE_ATTRIBUTE = 'data-e-scope';

const ELEMENT_NODE = 1;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function readData( doc ) {
	const dataScript = doc.getElementById( DATA_SCRIPT_ID );

	if ( ! dataScript ) {
		return null;
	}

	try {
		return JSON.parse( dataScript.textContent );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[data-flow] Invalid data', error );
		return null;
	}
}

function prefersReducedMotion( win ) {
	return Boolean( win.matchMedia?.( REDUCED_MOTION_QUERY ).matches );
}

export function initDataFlow( doc, { registry = createActionRegistry(), loop = createFrameLoop() } = {} ) {
	const data = readData( doc );

	if ( ! data ) {
		return null;
	}

	const win = doc.defaultView;
	const pageStore = createStore( data.state || {} );
	const scopeStores = createScopeStores( data.scopes || [], pageStore );
	const resolveStore = ( node ) => {
		const element = ELEMENT_NODE === node.nodeType ? node : node.parentElement;
		const scopeElement = element?.closest( `[${ SCOPE_ATTRIBUTE }]` );

		return scopeStores.get( scopeElement?.getAttribute( SCOPE_ATTRIBUTE ) ) ?? pageStore;
	};

	bindCssVars( doc.documentElement, pageStore );
	doc.querySelectorAll( `[${ SCOPE_ATTRIBUTE }]` ).forEach( ( element ) => {
		const store = scopeStores.get( element.getAttribute( SCOPE_ATTRIBUTE ) );

		if ( store ) {
			bindCssVars( element, store );
		}
	} );

	bindTextNodes( doc.body, resolveStore, data.bindings || [] );
	attachActions( data.actions || [], resolveStore, doc, {
		registry,
		loop,
		win,
		doc,
		reducedMotion: prefersReducedMotion( win ),
	} );

	return pageStore;
}

function createScopeStores( scopes, pageStore ) {
	const stores = new Map();

	scopes.forEach( ( { id, parentId, state } ) => {
		stores.set( id, createScopedStore( state || {}, stores.get( parentId ) ?? pageStore ) );
	} );

	return stores;
}
