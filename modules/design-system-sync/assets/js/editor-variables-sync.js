( function() {
	'use strict';

	const debounce = window.elementorV2?.utils?.debounce;
	const refresh = () => {
		const globals = $e.components.get( 'globals' );
		globals?.refreshGlobalData();
		globals?.populateGlobalData();
	};

	const scheduleRefresh = debounce
		? debounce( refresh, 100 )
		: ( function() {
			let refreshTimeout;
			return function() {
				clearTimeout( refreshTimeout );
				refreshTimeout = setTimeout( refresh, 100 );
			};
		}() );

	window.addEventListener( 'variables:updated', scheduleRefresh );
}() );
