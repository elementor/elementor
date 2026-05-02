describe( 'WpDashboardTracking', () => {
	afterEach( () => {
		delete window.elementorCommon;
		jest.resetModules();
	} );

	test( 'does not throw and returns safe defaults when elementorCommon is missing', () => {
		delete window.elementorCommon;

		jest.isolateModules( () => {
			const WpDashboardTracking = require( 'elementor-app/event-track/wp-dashboard-tracking' ).default;

			expect( () => WpDashboardTracking.isEditorOneActive() ).not.toThrow();
			expect( WpDashboardTracking.isEditorOneActive() ).toBe( false );
			expect( WpDashboardTracking.isEventsManagerAvailable() ).toBeFalsy();
			expect( WpDashboardTracking.canSendEvents() ).toBe( false );
			expect( () => WpDashboardTracking.dispatchEvent( 'test_event' ) ).not.toThrow();
		} );
	} );

	test( 'dispatchEvent calls elementorCommon.eventsManager.dispatchEvent when available', () => {
		const dispatchEvent = jest.fn();

		window.elementorCommon = {
			config: {
				editor_events: {
					can_send_events: true,
					isEditorOneActive: true,
				},
			},
			eventsManager: {
				dispatchEvent,
			},
		};

		jest.isolateModules( () => {
			const WpDashboardTracking = require( 'elementor-app/event-track/wp-dashboard-tracking' ).default;

			WpDashboardTracking.dispatchEvent( 'my_event', { a: 1 }, { send_immediately: true } );

			expect( dispatchEvent ).toHaveBeenCalledWith( 'my_event', { a: 1 }, { send_immediately: true } );
		} );
	} );
} );

