import {
	trackProSetupPromotionBannerClick,
	trackProSetupPromotionConnectResult,
	trackProSetupPromotionCtaClick,
	trackProSetupPromotionDismiss,
	trackProSetupPromotionImpression,
	trackProSetupPromotionResult,
} from '../analytics';
import {
	CTA_CLICKED_EVENT,
	PANEL_DISMISSED_EVENT,
	PANEL_VIEWED_EVENT,
	POPOVER_OPENED_EVENT,
	STEP_COMPLETED_EVENT,
	TRACKING_LOCATION_L1,
	TRACKING_TARGET_LOCATION,
	TRACKING_WINDOW_NAME,
} from '../analytics/constants';

const mockDispatchEvent = jest.fn();

jest.mock( '@elementor/events', () => ( {
	getMixpanel: () => ( { dispatchEvent: mockDispatchEvent } ),
} ) );

const BASE = {
	window_name: TRACKING_WINDOW_NAME,
	target_location: TRACKING_TARGET_LOCATION,
	location_l1: TRACKING_LOCATION_L1,
	state: 'install',
};

describe( 'pro setup promotion tracking', () => {
	beforeEach( () => {
		mockDispatchEvent.mockReset();
	} );

	it( 'dispatches pro_setup_panel_viewed', () => {
		trackProSetupPromotionImpression( 'install' );

		expect( mockDispatchEvent ).toHaveBeenCalledWith( PANEL_VIEWED_EVENT, {
			...BASE,
			interaction_type: 'view',
			target_type: 'banner',
			target_name: 'pro_setup_panel',
			interaction_result: 'panel_viewed',
		} );
	} );

	it( 'dispatches pro_setup_cta_clicked with state-specific target_name', () => {
		trackProSetupPromotionCtaClick( 'connect' );

		expect( mockDispatchEvent ).toHaveBeenCalledWith( CTA_CLICKED_EVENT, {
			...BASE,
			state: 'connect',
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'connect_and_activate',
			interaction_result: 'cta_clicked',
		} );
	} );

	it( 'dispatches pro_setup_step_completed with metadata on failure', () => {
		trackProSetupPromotionResult( 'activate', 'error', 'activate', 'Activation failed' );

		expect( mockDispatchEvent ).toHaveBeenCalledWith( STEP_COMPLETED_EVENT, {
			...BASE,
			state: 'activate',
			interaction_type: 'view',
			target_type: 'workflow',
			target_name: 'pro_setup',
			target_value: 'activate',
			interaction_result: 'step_failed',
			metadata: { error: 'Activation failed' },
		} );
	} );

	it( 'dispatches popover opened and dismiss events', () => {
		trackProSetupPromotionBannerClick( 'install' );
		trackProSetupPromotionDismiss( 'install' );

		expect( mockDispatchEvent ).toHaveBeenNthCalledWith(
			1,
			POPOVER_OPENED_EVENT,
			expect.objectContaining( { interaction_result: 'popover_opened' } )
		);
		expect( mockDispatchEvent ).toHaveBeenNthCalledWith(
			2,
			PANEL_DISMISSED_EVENT,
			expect.objectContaining( { interaction_result: 'panel_dismissed' } )
		);
	} );

	it( 'delegates connect result to step completed', () => {
		trackProSetupPromotionConnectResult( 'success' );

		expect( mockDispatchEvent ).toHaveBeenCalledWith(
			STEP_COMPLETED_EVENT,
			expect.objectContaining( {
				state: 'connect',
				interaction_result: 'step_completed',
				target_value: 'connect',
			} )
		);
	} );
} );
