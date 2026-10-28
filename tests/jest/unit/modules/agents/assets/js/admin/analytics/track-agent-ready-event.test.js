import {
	trackActivationClicked,
	trackBotPermissionChanged,
	trackFeatureToggled,
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
			post_type: 'page',
			interaction_result: 'excluded',
			location_l2: 'markdown',
		} ) );
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
} );
