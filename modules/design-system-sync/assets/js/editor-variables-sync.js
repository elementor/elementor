( function() {
	'use strict';

	let refreshTimeout;

	window.addEventListener( 'variables:updated', () => {
		clearTimeout( refreshTimeout );
		refreshTimeout = setTimeout( () => {
			const globals = $e.components.get( 'globals' );
			globals?.refreshGlobalData();
			globals?.populateGlobalData();
		}, 100 );
	} );
}() );
