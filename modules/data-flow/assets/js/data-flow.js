import { createActionRegistry } from './actions/action-registry';
import { initDataFlow } from './data-flow-runtime';

const registry = createActionRegistry();

window.elementorActions = { register: registry.register };

function init() {
	window.elementorDataFlow = initDataFlow( document, { registry } );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
