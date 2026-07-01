import {
	normalizeWidgetName,
	trackLockedWidgetPopupClick,
	trackLockedWidgetPopupShown,
} from 'elementor/modules/promotions/assets/js/editor/tracking';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';

describe( 'locked widget popover tracking', () => {
	let dispatchEvent;

	beforeEach( () => {
		dispatchEvent = jest.fn();
		window.elementorCommon = {
			config: { editor_events: { can_send_events: true } },
			eventsManager: {
				config: eventsConfig,
				dispatchEvent,
			},
		};
	} );

	afterEach( () => {
		delete window.elementorCommon;
		jest.clearAllMocks();
	} );

	describe( 'normalizeWidgetName', () => {
		test.each( [
			[ 'posts', 'posts' ],
			[ 'loop-grid', 'loop_grid' ],
			[ 'Loop Grid', 'loop_grid' ],
			[ '  form  ', 'form' ],
			[ '', '' ],
			[ null, '' ],
			[ undefined, '' ],
		] )( 'normalizes %p to %p', ( input, expected ) => {
			expect( normalizeWidgetName( input ) ).toBe( expected );
		} );
	} );

	describe( 'trackLockedWidgetPopupShown', () => {
		test( 'dispatches popup_shown event with expected shape', () => {
			trackLockedWidgetPopupShown( 'loop_grid' );

			expect( dispatchEvent ).toHaveBeenCalledWith( 'locked_widget_popup_opened', {
				app_type: 'editor',
				window_name: 'editor',
				interaction_type: 'popup_shown',
				target_type: 'popup',
				target_name: 'locked_widget_promotion_loop_grid_popup',
				interaction_result: 'popup_viewed',
				target_location: 'editor',
				location_l1: 'widget_panel',
			} );
		} );

		test( 'no-ops without a widget name', () => {
			trackLockedWidgetPopupShown( '' );
			expect( dispatchEvent ).not.toHaveBeenCalled();
		} );

		test( 'no-ops when eventsManager is unavailable', () => {
			delete window.elementorCommon;
			expect( () => trackLockedWidgetPopupShown( 'loop_grid' ) ).not.toThrow();
		} );
	} );

	describe( 'trackLockedWidgetPopupClick', () => {
		test( 'dispatches upgrade_now click', () => {
			trackLockedWidgetPopupClick( 'loop_grid', 'upgrade_now' );

			expect( dispatchEvent ).toHaveBeenCalledWith( 'locked_widget_popup_cta_click', {
				app_type: 'editor',
				window_name: 'editor',
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'upgrade_now',
				interaction_result: 'exit_to_landing_page',
				target_location: 'locked_widget_promotion_loop_grid_popup',
				location_l1: 'locked_widget_promotion_loop_grid',
			} );
		} );

		test( 'dispatches cancel click', () => {
			trackLockedWidgetPopupClick( 'posts', 'cancel' );

			expect( dispatchEvent ).toHaveBeenCalledWith( 'locked_widget_popup_cta_click', {
				app_type: 'editor',
				window_name: 'editor',
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'cancel',
				interaction_result: 'cancel',
				target_location: 'locked_widget_promotion_posts_popup',
				location_l1: 'cancel_button',
			} );
		} );

		test( 'no-ops without a widget name', () => {
			trackLockedWidgetPopupClick( '', 'upgrade_now' );
			expect( dispatchEvent ).not.toHaveBeenCalled();
		} );
	} );
} );
