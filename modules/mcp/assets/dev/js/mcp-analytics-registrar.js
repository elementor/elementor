( function () {
	const composer = window.elementorMcpComposer;

	if ( ! composer || 'function' !== typeof composer.registerEventHandler ) {
		return;
	}

	composer.registerEventHandler( function ( name, props ) {
		window.elementorCommon?.eventsManager?.dispatchEvent?.( name, props );
	}, { priority: 10 } );
} )();
