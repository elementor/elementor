import {
	trackActivationClicked,
	trackBotPermissionChanged,
	trackCustomCrawlerAdded,
	trackDashboardCtaClicked,
	trackFeatureConflictDetected,
	trackFeatureToggled,
	trackFileOpened,
	trackPostTypeToggled,
	trackWelcomeViewed,
} from 'elementor/modules/agents/assets/js/admin/analytics/track-agent-ready-event';

describe( 'track-agent-ready-event', () => {
	let dispatchEvent;

	beforeEach( () => {
		dispatchEvent = jest.fn();
		window.elementorCommon = { eventsManager: { dispatchEvent } };
	} );

	afterEach( () => {
		delete window.elementorCommon;
	} );

	it( 'should not throw when elementorCommon is missing', () => {
		// Arrange
		delete window.elementorCommon;

		// Act & Assert
		expect( () => trackWelcomeViewed() ).not.toThrow();
	} );

	it( 'should dispatch welcome viewed with wpadmin app type', () => {
		// Act
		trackWelcomeViewed();

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_welcome_viewed', expect.objectContaining( {
			app_type: 'wpadmin',
			window_name: 'agent_readiness_onboarding',
			interaction_type: 'view',
			location_l1: 'agent_readiness',
			location_l2: 'activation',
		} ) );
	} );

	it( 'should dispatch activation clicked', () => {
		// Act
		trackActivationClicked();

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_activation_clicked', expect.objectContaining( {
			target_name: 'activate_button',
			interaction_result: 'all_defaults_activated',
		} ) );
	} );

	it.each( [
		[ true, 'feature_enabled' ],
		[ false, 'feature_disabled' ],
	] )( 'should map feature toggled isEnabled=%s to %s', ( isEnabled, expectedResult ) => {
		// Act
		trackFeatureToggled( { featureName: 'llms_txt', isEnabled, hasConflict: true } );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_feature_toggled', expect.objectContaining( {
			feature_name: 'llms_txt',
			interaction_result: expectedResult,
			has_conflict: true,
		} ) );
	} );

	it( 'should dispatch post type toggled with feature based location', () => {
		// Act
		trackPostTypeToggled( { featureName: 'markdown', postType: 'page', isIncluded: false } );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_post_type_toggled', expect.objectContaining( {
			feature_name: 'markdown',
			post_type: 'pages',
			interaction_result: 'excluded',
			location_l2: 'markdown',
		} ) );
	} );

	it.each( [
		[ 'post', 'posts' ],
		[ 'page', 'pages' ],
		[ 'product', 'products' ],
		[ 'portfolio', 'portfolio' ],
	] )( 'should send post type %s as %s', ( postType, expectedName ) => {
		// Act
		trackPostTypeToggled( { featureName: 'llms_txt', postType, isIncluded: true } );

		// Assert
		expect( dispatchEvent.mock.calls[ 0 ][ 1 ].post_type ).toBe( expectedName );
	} );

	it( 'should dispatch single bot permission change', () => {
		// Act
		trackBotPermissionChanged( {
			scope: 'single',
			crawlerId: 'GPTBot',
			permissionType: 'ai_train',
			isAllowed: false,
			targetType: 'checkbox',
		} );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_bot_permission_changed', expect.objectContaining( {
			scope: 'single',
			crawler_id: 'GPTBot',
			permission_type: 'ai_train',
			interaction_result: 'blocked',
			target_type: 'checkbox',
		} ) );
	} );

	it( 'should omit permission type for row level changes', () => {
		// Act
		trackBotPermissionChanged( { scope: 'bulk', crawlerId: 'GPTBot', isAllowed: true, targetType: 'button' } );

		// Assert
		expect( dispatchEvent.mock.calls[ 0 ][ 1 ] ).not.toHaveProperty( 'permission_type' );
	} );

	it( 'should dispatch feature conflict detected as a view with a conflict flag', () => {
		// Act
		trackFeatureConflictDetected( { featureName: 'bot_access' } );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_feature_conflict_detected', expect.objectContaining( {
			interaction_type: 'view',
			target_name: 'file_conflict',
			feature_name: 'bot_access',
			interaction_result: 'conflict_detected',
			has_conflict: true,
		} ) );
	} );

	it.each( [ 'llms_txt', 'markdown' ] )( 'should dispatch file opened for %s with a matching location', ( fileType ) => {
		// Act
		trackFileOpened( { fileType } );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_file_opened', expect.objectContaining( {
			target_name: 'edit_file_button',
			file_type: fileType,
			interaction_result: 'opened_for_edit',
			location_l2: fileType,
		} ) );
	} );

	it( 'should dispatch custom crawler added with the crawler token', () => {
		// Act
		trackCustomCrawlerAdded( { crawlerToken: 'GPTBot' } );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'agent_readiness_custom_crawler_added', expect.objectContaining( {
			target_name: 'add_custom_crawler_button',
			crawler_token: 'GPTBot',
			interaction_result: 'success',
			location_l2: 'bot_access',
		} ) );
	} );

	it( 'should attach the site key as the site id to every event', () => {
		// Arrange
		const siteKey = 'site-key';
		window.elementorAgentsReadyConfig = { siteKey };

		// Act
		trackWelcomeViewed();

		// Assert
		expect( dispatchEvent.mock.calls[ 0 ][ 1 ].site_id ).toBe( siteKey );

		delete window.elementorAgentsReadyConfig;
	} );

	it( 'should leave the site id empty when no site key is available', () => {
		// Act
		trackWelcomeViewed();

		// Assert
		expect( dispatchEvent.mock.calls[ 0 ][ 1 ].site_id ).toBeUndefined();
	} );

	it( 'should dispatch dashboard cta clicked with the state and a beacon transport', () => {
		// Act
		trackDashboardCtaClicked( 'needs_work' );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith(
			'agent_readiness_dashboard_cta_clicked',
			expect.objectContaining( {
				window_name: 'wp_dashboard',
				target_name: 'dashboard_cta',
				interaction_result: 'needs_work',
				target_location: 'overview_widget',
			} ),
			{ transport: 'sendBeacon' },
		);
	} );
} );
