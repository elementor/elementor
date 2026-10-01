import { ANY_KEY } from './data-flow-store';

const BINDING_PATTERN = /\{\{\s*state\.([\w.]+)\s*\}\}/g;

function hasBinding( text ) {
	return new RegExp( BINDING_PATTERN.source ).test( text );
}

function getByPath( source, path ) {
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

export function bindTextNodes( root, store ) {
	const bindings = collectBoundTextNodes( root );

	const render = () => {
		bindings.forEach( ( { node, template } ) => {
			node.textContent = renderTemplate( template, store.getState() );
		} );
	};

	render();

	return store.subscribe( ANY_KEY, render );
}
