import { hasBinding, renderTemplate } from './data-flow-bindings';
import { resolveScopeChain } from './data-flow-editor-state';
import { writeBoundAttribute } from './data-flow-manifest';
import { attachSnippets } from './data-flow-snippets';
import { ANY_KEY, createScopedStore, createStore } from './data-flow-store';
import { applyStateKey } from './data-flow-visual';

const ELEMENT_SELECTOR = '[data-id]';
const ELEMENT_ID_ATTRIBUTE = 'data-id';
const PAGE_SCOPE = 'page';
const OBSERVER_OPTIONS = { attributes: true, childList: true, subtree: true, characterData: true };
const SLOW_HANDLER_MS = 4;

function getElementChain( node, root ) {
	const chain = [];
	let element = node.parentElement?.closest( ELEMENT_SELECTOR );

	while ( element && root.contains( element ) ) {
		chain.unshift( element.dataset.id );
		element = element.parentElement?.closest( ELEMENT_SELECTOR );
	}

	return chain;
}

function getScopeParams( entry ) {
	return entry.componentParams ?? entry.stateParams ?? [];
}

function getAttributeTemplate( value, previous ) {
	if ( previous?.text === value ) {
		return previous.template;
	}

	return hasBinding( value ) ? value : null;
}

function toSchema( params ) {
	return Object.fromEntries(
		params.map( ( param ) => [ param.key, { prop_type: param.prop_type ?? param.type, options: param.options } ] ),
	);
}

export function createEditorPreviewRenderer( { root, getElementEntry, getPageState, getSnippetEntries, registry, loadSnippet } ) {
	const renderedNodes = new WeakMap();
	const renderedAttributes = new WeakMap();
	const scopeStores = new Map();
	const scopeSignatures = new Map();
	const observer = new MutationObserver( () => schedule() );
	let frame = null;
	let pageStore = null;
	let snippetAttacher = null;

	const getPageStore = () => {
		pageStore ??= createStore( getPageState() );

		return pageStore;
	};

	const getChainOfElement = ( element ) => [ ...getElementChain( element, root ), element.dataset.id ];
	const getChainOfNode = ( node ) =>
		node.nodeType === Node.ELEMENT_NODE && node.matches( ELEMENT_SELECTOR )
			? getChainOfElement( node )
			: getElementChain( node, root );

	const getScopeStore = ( chain ) => {
		const scopeIds = chain.filter( ( id ) => getScopeParams( getElementEntry( id ) ).length );
		let isParentRebuilt = false;

		chain.filter( ( id ) => ! scopeIds.includes( id ) ).forEach( ( id ) => {
			scopeStores.delete( id );
			scopeSignatures.delete( id );
		} );

		return scopeIds.reduce( ( parent, id ) => {
			const params = getScopeParams( getElementEntry( id ) );
			const signature = JSON.stringify( params );
			const isStale = isParentRebuilt || scopeSignatures.get( id ) !== signature;

			if ( isStale ) {
				const resolved = resolveScopeChain( chain.slice( 0, chain.indexOf( id ) + 1 ).map( getElementEntry ), getPageState() );
				const own = Object.fromEntries( params.map( ( { key } ) => [ key, resolved[ key ] ] ) );
				const store = createScopedStore( own, parent, toSchema( params ) );

				store.subscribe( ANY_KEY, () => schedule() );
				scopeStores.set( id, store );
				scopeSignatures.set( id, signature );
			}

			isParentRebuilt = isStale;

			return scopeStores.get( id );
		}, getPageStore() );
	};

	const resolveStoreForElement = ( node ) => {
		const element = 1 === node.nodeType ? node : node.parentElement;
		const owner = element?.closest( ELEMENT_SELECTOR );

		return owner ? getScopeStore( getChainOfElement( owner ) ) : getPageStore();
	};

	const getState = ( chain, pageState, scopeId = '' ) => {
		getScopeStore( chain );

		if ( PAGE_SCOPE === scopeId ) {
			return getPageStore().getState();
		}

		if ( scopeId && scopeStores.has( scopeId ) ) {
			return scopeStores.get( scopeId ).getState();
		}

		const innermostScope = [ ...chain ].reverse().find( ( id ) => scopeStores.has( id ) );

		return innermostScope ? scopeStores.get( innermostScope ).getState() : resolveScopeChain( chain.map( getElementEntry ), pageState );
	};

	const getTemplate = ( node ) => {
		const rendered = renderedNodes.get( node );

		if ( rendered && rendered.text === node.textContent ) {
			return rendered.template;
		}

		return hasBinding( node.textContent ) ? node.textContent : null;
	};

	const renderNode = ( node, pageState ) => {
		const template = getTemplate( node );

		if ( null === template ) {
			renderedNodes.delete( node );

			return;
		}

		const chain = getChainOfNode( node );
		const text = renderTemplate(
			template,
			getState( chain, pageState ),
			( scopeId ) => getState( chain, pageState, scopeId ),
		);

		node.textContent = text;
		renderedNodes.set( node, { template, text } );
	};

	const renderAttributes = ( pageState ) => {
		root.querySelectorAll( '*' ).forEach( ( element ) => {
			const rendered = renderedAttributes.get( element ) ?? new Map();
			const names = new Set( [ ...element.getAttributeNames(), ...rendered.keys() ] );
			const chain = getChainOfNode( element );

			names.forEach( ( name ) => {
				const value = element.getAttribute( name );
				const previous = rendered.get( name );
				const template = getAttributeTemplate( value, previous );

				if ( ! template ) {
					rendered.delete( name );

					return;
				}

				const text = renderTemplate(
					template,
					getState( chain, pageState ),
					( scopeId ) => getState( chain, pageState, scopeId ),
				);

				writeBoundAttribute( element, name, text );
				rendered.set( name, { template, text: element.getAttribute( name ) } );
			} );

			if ( rendered.size ) {
				renderedAttributes.set( element, rendered );
			} else {
				renderedAttributes.delete( element );
			}
		} );
	};

	const renderVisualState = ( pageState ) => {
		root.querySelectorAll( ELEMENT_SELECTOR ).forEach( ( element ) => {
			const params = getScopeParams( getElementEntry( element.getAttribute( ELEMENT_ID_ATTRIBUTE ) ) );

			if ( ! params.length ) {
				return;
			}

			const state = getState( getChainOfElement( element ), pageState );
			const schema = toSchema( params );

			params.forEach( ( { key } ) => applyStateKey( element, key, state[ key ], schema[ key ].prop_type ) );
		} );
	};

	const syncSnippets = () => {
		if ( ! registry ) {
			return;
		}

		getSnippetEntries().forEach( ( { snippets } ) => snippets.forEach( ( { snippet } ) => loadSnippet( snippet ) ) );

		snippetAttacher ??= attachSnippets( {
			entries: getSnippetEntries,
			registry,
			storeOrResolver: resolveStoreForElement,
			pageStore: getPageStore(),
			root,
			selectorAttribute: ELEMENT_ID_ATTRIBUTE,
			warnAboveMs: SLOW_HANDLER_MS,
		} );

		snippetAttacher.attachPending();
	};

	const render = () => {
		frame = null;
		observer.disconnect();

		const pageState = getPageState();
		const walker = root.ownerDocument.createTreeWalker( root, NodeFilter.SHOW_TEXT );

		while ( walker.nextNode() ) {
			if ( 'SCRIPT' !== walker.currentNode.parentNode?.nodeName ) {
				renderNode( walker.currentNode, pageState );
			}
		}

		renderAttributes( pageState );
		renderVisualState( pageState );
		syncSnippets();
		observer.observe( root, OBSERVER_OPTIONS );
	};

	const schedule = () => {
		if ( null === frame ) {
			frame = root.ownerDocument.defaultView.requestAnimationFrame( render );
		}
	};

	const destroy = () => {
		observer.disconnect();
		snippetAttacher?.stop?.();

		if ( null !== frame ) {
			root.ownerDocument.defaultView.cancelAnimationFrame( frame );
		}
	};

	return { render, schedule, destroy };
}
