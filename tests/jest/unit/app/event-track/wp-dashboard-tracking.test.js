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

	describe( 'isElementorPage', () => {
		test( 'should return true for any pages that have "elementor" in the URL', () => {
			jest.isolateModules( () => {
				const WpDashboardTracking = require( 'elementor-app/event-track/wp-dashboard-tracking' ).default;

				const validUrls = [
					'https://example.com/wp-admin/admin.php?page=elementor',
					'https://example.com/wp-admin/admin.php?page=elementor-home',
					'https://example.com/wp-admin/admin.php?page=elementor_something',
					'https://example.com/wp-admin/admin.php?page=elementor-else',
				];

				validUrls.forEach( ( url ) => {
					expect( WpDashboardTracking.isElementorPage( url ) ).toBe( true );
				} );
			} );
		} );

		test( 'should return true for other valid urls', () => {
			jest.isolateModules( () => {
				const WpDashboardTracking = require( 'elementor-app/event-track/wp-dashboard-tracking' ).default;

				const validUrls = [
					'https://example.com/wp-admin/post.php?post=8&action=elementor',
					'https://example.com/wp-admin/admin.php?page=e-form-submissions',
					'https://example.com/wp-admin/post-new.php?post_type=elementor_library',
					'https://example.com/wp-admin/post-new.php?post_type=e-floating-buttons',
					'https://example.com/wp-admin/post-new.php?post_type=popup_templates',
				];

				validUrls.forEach( ( url ) => {
					expect( WpDashboardTracking.isElementorPage( url ) ).toBe( true );
				} );
			} );
		} );

		test( 'should return false for invalid pages', () => {
			jest.isolateModules( () => {
				const WpDashboardTracking = require( 'elementor-app/event-track/wp-dashboard-tracking' ).default;

				const invalidUrls = [
					'https://example.com/wp-admin/admin.php?page=something',
					'https://example.com/wp-admin/post.php?post=8&action=edit',
					'https://example.com/wp-admin/plugins.php',
				];

				invalidUrls.forEach( ( url ) => {
					expect( WpDashboardTracking.isElementorPage( url ) ).toBe( false );
				} );
			} );
		} );
	} );
} );
