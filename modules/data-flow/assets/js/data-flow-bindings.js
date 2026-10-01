import { ANY_KEY, toStoreResolver } from './data-flow-store';

const BINDING_PATTERN = /\{\{\s*state\.([\w.]+)\s*\}\}/g;

export function hasBinding( text ) {
	return new RegExp( BINDING_PATTERN.source ).test( text );
}

export function getByPath( source, path ) {
	return path.split( '.' ).reduce( ( value, key ) => value?.[ key ], source );
}

function formatValue( value ) {
	if ( undefined === value || null === value ) {
		return '';
	}

	if ( 'object' === typeof value ) {
		return JSON.stringify( value );
	}

	return String( value );
}

export function renderTemplate( template, state ) {
	return template.replace( BINDING_PATTERN, ( match, path ) => formatValue( getByPath( state, path ) ) );
}

function getTemplateForNode( node, serverBindings, nextServerBindingIndex ) {
	const serverBinding = serverBindings[ nextServerBindingIndex ];

	if ( serverBinding && serverBinding.text === node.textContent ) {
		return { template: serverBinding.template, isServerBinding: true };
	}

	if ( hasBinding( node.textContent ) ) {
		return { template: node.textContent, isServerBinding: false };
	}

	return null;
}

// Server rendered nodes no longer contain placeholders, so they are matched to their templates by text, in document order.
function collectBoundTextNodes( root, serverBindings ) {
	const walker = root.ownerDocument.createTreeWalker( root, NodeFilter.SHOW_TEXT );
	const bindings = [];
	let nextServerBindingIndex = 0;

	while ( walker.nextNode() ) {
		const node = walker.currentNode;

		if ( 'SCRIPT' === node.parentNode?.nodeName ) {
			continue;
		}

		const match = getTemplateForNode( node, serverBindings, nextServerBindingIndex );

		if ( ! match ) {
			continue;
		}

		if ( match.isServerBinding ) {
			nextServerBindingIndex++;
		}

		bindings.push( { node, template: match.template } );
	}

	return bindings;
}

function groupBindingsByStore( bindings, resolveStore ) {
	const groups = new Map();

	bindings.forEach( ( binding ) => {
		const store = resolveStore( binding.node );

		if ( ! groups.has( store ) ) {
			groups.set( store, [] );
		}

		groups.get( store ).push( binding );
	} );

	return groups;
}

export function bindTextNodes( root, storeOrResolver, serverBindings = [] ) {
	const bindings = collectBoundTextNodes( root, serverBindings );
	const groups = groupBindingsByStore( bindings, toStoreResolver( storeOrResolver ) );

	const unsubscribers = [ ...groups ].map( ( [ store, storeBindings ] ) => {
		const render = () => {
			storeBindings.forEach( ( { node, template } ) => {
				node.textContent = renderTemplate( template, store.getState() );
			} );
		};

		render();

		return store.subscribe( ANY_KEY, render );
	} );

	return () => unsubscribers.forEach( ( unsubscribe ) => unsubscribe() );
}
