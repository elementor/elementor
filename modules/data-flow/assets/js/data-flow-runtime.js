import { bindTextNodes } from './data-flow-bindings';
import { attachHandlers } from './data-flow-handlers';
import { createScopedStore, createStore } from './data-flow-store';

export const DATA_SCRIPT_ID = 'elementor-data-flow-data';
export const SCOPE_ATTRIBUTE = 'data-e-scope';

const ELEMENT_NODE = 1;

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

export function initDataFlow( doc ) {
	const data = readData( doc );

	if ( ! data ) {
		return null;
	}

	const pageStore = createStore( data.state || {} );
	const scopeStores = createScopeStores( data.scopes || [], pageStore );
	const resolveStore = ( node ) => {
		const element = ELEMENT_NODE === node.nodeType ? node : node.parentElement;
		const scopeElement = element?.closest( `[${ SCOPE_ATTRIBUTE }]` );

		return scopeStores.get( scopeElement?.getAttribute( SCOPE_ATTRIBUTE ) ) ?? pageStore;
	};

	bindTextNodes( doc.body, resolveStore, data.bindings || [] );
	attachHandlers( data.handlers || [], resolveStore, doc );

	return pageStore;
}

function createScopeStores( scopes, pageStore ) {
	const stores = new Map();

	scopes.forEach( ( { id, parentId, state } ) => {
		stores.set( id, createScopedStore( state || {}, stores.get( parentId ) ?? pageStore ) );
	} );

	return stores;
}
