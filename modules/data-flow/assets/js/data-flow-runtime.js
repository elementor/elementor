import { bindManifests } from './data-flow-manifest';
import { attachSnippets } from './data-flow-snippets';
import { createScopedStore, createStore } from './data-flow-store';
import { bindVisualState } from './data-flow-visual';

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

export function initDataFlow( doc, registry ) {
	const data = readData( doc );

	if ( ! data ) {
		return null;
	}

	const pageStore = createStore( data.state || {}, data.schema || {} );
	const scopeStores = createScopeStores( data.scopes || [], pageStore );
	const resolveStore = ( node, scopeId ) => {
		if ( scopeId && scopeStores.has( scopeId ) ) {
			return scopeStores.get( scopeId );
		}

		const element = ELEMENT_NODE === node.nodeType ? node : node.parentElement;
		const scopeElement = element?.closest( `[${ SCOPE_ATTRIBUTE }]` );

		return scopeStores.get( scopeElement?.getAttribute( SCOPE_ATTRIBUTE ) ) ?? pageStore;
	};

	bindManifests( doc.body, resolveStore );
	bindVisualState( { doc, pageStore, scopeStores, scopes: data.scopes || [], pageSchema: data.schema || {} } );
	attachSnippets( { entries: data.snippets || [], registry, storeOrResolver: resolveStore, pageStore, root: doc } );

	return pageStore;
}

function createScopeStores( scopes, pageStore ) {
	const stores = new Map();

	scopes.forEach( ( { id, parentId, state, schema } ) => {
		stores.set( id, createScopedStore( state || {}, stores.get( parentId ) ?? pageStore, schema || {} ) );
	} );

	return stores;
}
