import { formatBinding } from './data-flow-manifest';
import { ANY_KEY, toStoreResolver } from './data-flow-store';

const BINDING_PATTERN = /\{\{\s*state(?:@([\w-]+))?\.([\w.]+)(?:\|(raw|number|percent))?\s*\}\}/g;

export function hasBinding( text ) {
	return new RegExp( BINDING_PATTERN.source ).test( text );
}

export function getByPath( source, path ) {
	return path.split( '.' ).reduce( ( value, key ) => value?.[ key ], source );
}

export function renderTemplate( template, state, resolveScope ) {
	return template.replace( BINDING_PATTERN, ( match, scope, path, format ) =>
		formatBinding( getByPath( scope ? resolveScope?.( scope ) ?? state : state, path ), { format } ),
	);
}

function collectBoundTextNodes( root ) {
	const walker = root.ownerDocument.createTreeWalker( root, NodeFilter.SHOW_TEXT );
	const bindings = [];

	while ( walker.nextNode() ) {
		const node = walker.currentNode;

		if ( 'SCRIPT' !== node.parentNode?.nodeName && hasBinding( node.textContent ) ) {
			bindings.push( { node, template: node.textContent } );
		}
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

export function bindTextNodes( root, storeOrResolver ) {
	const bindings = collectBoundTextNodes( root );
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
