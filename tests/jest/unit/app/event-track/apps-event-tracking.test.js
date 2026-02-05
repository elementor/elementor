describe( 'AppsEventTracking', () => {
	afterEach( () => {
		delete window.elementorCommon;
		jest.resetModules();
	} );

	test( 'dispatchEvent does not throw when elementorCommon is missing', () => {
		delete window.elementorCommon;

		jest.isolateModules( () => {
			const { AppsEventTracking } = require( 'elementor-app/event-track/apps-event-tracking' );

			expect( () => AppsEventTracking.dispatchEvent( 'test_event', { a: 1 } ) ).not.toThrow();
			expect( AppsEventTracking.dispatchEvent( 'test_event', { a: 1 } ) ).toBeUndefined();
		} );
	} );

	test( 'dispatchEvent calls elementorCommon.eventsManager.dispatchEvent when available', () => {
		const dispatchEvent = jest.fn();

		window.elementorCommon = {
			eventsManager: {
				dispatchEvent,
			},
		};

		jest.isolateModules( () => {
			const { AppsEventTracking } = require( 'elementor-app/event-track/apps-event-tracking' );

			AppsEventTracking.dispatchEvent( 'my_event', { a: 1 } );

			expect( dispatchEvent ).toHaveBeenCalledWith( 'my_event', { a: 1 } );
		} );
	} );
} );

