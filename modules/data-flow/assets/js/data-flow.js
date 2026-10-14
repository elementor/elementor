import { initDataFlow } from './data-flow-runtime';
import { createSnippetRegistry } from './data-flow-snippet-registry';

const registry = createSnippetRegistry();

window.elementorDataFlow = { registerSnippet: registry.registerSnippet };

function init() {
	window.elementorDataFlow.store = initDataFlow( document, registry );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
