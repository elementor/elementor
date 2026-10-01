import { initDataFlow } from './data-flow-runtime';

function init() {
	window.elementorDataFlow = initDataFlow( document );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
