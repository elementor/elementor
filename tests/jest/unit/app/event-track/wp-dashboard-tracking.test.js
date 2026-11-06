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
					'https://example.com/wp-admin/admin.php?page=popup_templates',
					'https://example.com/wp-admin/edit.php?post_type=elementor_snippet',
					'https://example.com/wp-admin/edit.php?post_type=elementor_font',
					'https://example.com/wp-admin/edit.php?post_type=elementor_icons',
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
					expect( WpDashboardTracking.isElementorPage( url ) ).not.toBe( true );
				} );
			} );
		} );
	} );

	describe( 'isNavigatingAwayFromElementor', () => {
		test( 'does not throw and returns false when given a non-string value', () => {
			jest.isolateModules( () => {
				const WpDashboardTracking = require( 'elementor-app/event-track/wp-dashboard-tracking' ).default;

				// A form control named "action" (e.g. `<input name="action">`) shadows
				// `HTMLFormElement.action`, so callers may accidentally pass a DOM element here.
				const shadowedFormAction = document.createElement( 'input' );

				expect( () => WpDashboardTracking.isNavigatingAwayFromElementor( shadowedFormAction ) ).not.toThrow();
				expect( WpDashboardTracking.isNavigatingAwayFromElementor( shadowedFormAction ) ).toBe( false );
			} );
		} );
	} );

	describe( 'getFormActionUrl', () => {
		test( 'returns the string action when it is not shadowed by a form control', () => {
			jest.isolateModules( () => {
				const WpDashboardTracking = require( 'elementor-app/event-track/wp-dashboard-tracking' ).default;

				const form = document.createElement( 'form' );
				form.setAttribute( 'action', 'https://example.com/wp-admin/edit.php' );

				expect( WpDashboardTracking.getFormActionUrl( form ) ).toBe( 'https://example.com/wp-admin/edit.php' );
			} );
		} );

		test( 'falls back to the raw attribute when a named "action" control shadows form.action', () => {
			jest.isolateModules( () => {
				const WpDashboardTracking = require( 'elementor-app/event-track/wp-dashboard-tracking' ).default;

				const form = document.createElement( 'form' );
				form.setAttribute( 'action', 'https://example.com/wp-admin/edit.php?post_type=elementor_library' );

				const actionInput = document.createElement( 'input' );
				actionInput.setAttribute( 'type', 'hidden' );
				actionInput.setAttribute( 'name', 'action' );
				actionInput.setAttribute( 'value', 'elementor_new_post' );
				form.appendChild( actionInput );

				// Real browsers shadow `HTMLFormElement.action` with a named form control
				// (e.g. `<input name="action">`, the WordPress admin-post/admin-ajax convention).
				// jsdom does not replicate that quirk, so we simulate it directly here.
				Object.defineProperty( form, 'action', { value: actionInput, configurable: true } );

				expect( WpDashboardTracking.getFormActionUrl( form ) )
					.toBe( 'https://example.com/wp-admin/edit.php?post_type=elementor_library' );
			} );
		} );
	} );
} );
