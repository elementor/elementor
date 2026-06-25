import ScreenViewTracking from 'elementor-app/event-track/dashboard/screen-view';
import WpDashboardTracking from 'elementor-app/event-track/wp-dashboard-tracking';
import { DashboardUtils } from 'elementor-app/event-track/dashboard/utils';

jest.mock( 'elementor-app/event-track/wp-dashboard-tracking' );
jest.mock( 'elementor-app/event-track/dashboard/utils' );

describe( 'ScreenViewTracking', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		ScreenViewTracking.trackedScreens.clear();
	} );

	test( 'init should track initial screen view if it is an Elementor page', () => {
		DashboardUtils.isElementorPage.mockReturnValue( true );

		// Mock getScreenData
		const screenData = { screenId: 'elementor-settings', screenType: 'top_level_page' };
		jest.spyOn( ScreenViewTracking, 'getScreenData' ).mockReturnValue( screenData );

		ScreenViewTracking.init();

		expect( WpDashboardTracking.trackScreenViewed ).toHaveBeenCalledWith(
			'elementor-settings',
			'top_level_page',
		);
	} );

	test( 'init should not track initial screen view if it is not an Elementor page', () => {
		DashboardUtils.isElementorPage.mockReturnValue( false );

		ScreenViewTracking.init();

		expect( WpDashboardTracking.trackScreenViewed ).not.toHaveBeenCalled();
	} );
} );
