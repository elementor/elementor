import { hasBinding, renderTemplate } from './data-flow-bindings';
import { resolveScopeChain } from './data-flow-editor-state';

const ELEMENT_SELECTOR = '[data-id]';
const OBSERVER_OPTIONS = { childList: true, subtree: true, characterData: true };

function getElementChain( node, root ) {
	const chain = [];
	let element = node.parentElement?.closest( ELEMENT_SELECTOR );

	while ( element && root.contains( element ) ) {
		chain.unshift( element.dataset.id );
		element = element.parentElement?.closest( ELEMENT_SELECTOR );
	}

	return chain;
}

export function createEditorPreviewRenderer( { root, getElementEntry, getPageState } ) {
	const renderedNodes = new WeakMap();
	const observer = new MutationObserver( () => schedule() );
	let frame = null;

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

		const chain = getElementChain( node, root ).map( ( id ) => getElementEntry( id ) );
		const text = renderTemplate( template, resolveScopeChain( chain, pageState ) );

		node.textContent = text;
		renderedNodes.set( node, { template, text } );
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

		observer.observe( root, OBSERVER_OPTIONS );
	};

	const schedule = () => {
		if ( null === frame ) {
			frame = root.ownerDocument.defaultView.requestAnimationFrame( render );
		}
	};

	const destroy = () => {
		observer.disconnect();

		if ( null !== frame ) {
			root.ownerDocument.defaultView.cancelAnimationFrame( frame );
		}
	};

	return { render, schedule, destroy };
}
