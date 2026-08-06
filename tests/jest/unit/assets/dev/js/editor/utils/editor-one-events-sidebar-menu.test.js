import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';

describe( 'EditorOneEventManager sidebar menu events', () => {
	let dispatchEvent;

	beforeEach( () => {
		// Arrange
		dispatchEvent = jest.fn();

		window.elementorCommon = {
			config: {
				editor_events: {
					can_send_events: true,
				},
			},
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

	test( 'sendSidebarMenuItemClicked omits location_l1 for top-level items', () => {
		// Act
		EditorOneEventManager.sendSidebarMenuItemClicked( { eventId: 'settings' } );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'sidebar_menu_item_clicked', {
			window_name: 'sidebar_menu',
			interaction_type: 'click',
			target_type: 'link',
			target_name: 'settings',
			interaction_result: 'page_opened',
			target_location: 'sidebar',
		} );
		expect( dispatchEvent.mock.calls[ 0 ][ 1 ] ).not.toHaveProperty( 'location_l1' );
	} );

	test( 'sendSidebarMenuItemClicked sets location_l1 for nested items', () => {
		// Act
		EditorOneEventManager.sendSidebarMenuItemClicked( {
			eventId: 'system_info',
			groupEventId: 'system',
		} );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'sidebar_menu_item_clicked', {
			window_name: 'sidebar_menu',
			interaction_type: 'click',
			target_type: 'link',
			target_name: 'system_info',
			interaction_result: 'page_opened',
			target_location: 'sidebar',
			location_l1: 'system',
		} );
	} );

	test( 'sendSidebarMenuGroupToggled dispatches expanded when group opens', () => {
		// Act
		EditorOneEventManager.sendSidebarMenuGroupToggled( {
			eventId: 'templates',
			isExpanded: true,
		} );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'sidebar_menu_group_toggled', {
			window_name: 'sidebar_menu',
			interaction_type: 'click',
			target_type: 'toggle',
			target_name: 'templates',
			interaction_result: 'expanded',
			target_location: 'sidebar',
		} );
	} );

	test( 'sendSidebarMenuGroupToggled dispatches collapsed when group closes', () => {
		// Act
		EditorOneEventManager.sendSidebarMenuGroupToggled( {
			eventId: 'custom_elements',
			isExpanded: false,
		} );

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'sidebar_menu_group_toggled', {
			window_name: 'sidebar_menu',
			interaction_type: 'click',
			target_type: 'toggle',
			target_name: 'custom_elements',
			interaction_result: 'collapsed',
			target_location: 'sidebar',
		} );
	} );

	test( 'does not dispatch when events cannot be sent', () => {
		// Arrange
		window.elementorCommon.config.editor_events.can_send_events = false;

		// Act
		EditorOneEventManager.sendSidebarMenuItemClicked( { eventId: 'settings' } );

		// Assert
		expect( dispatchEvent ).not.toHaveBeenCalled();
	} );

	test( 'sendSidebarMenuItemClicked does not throw when dispatch fails', () => {
		// Arrange
		dispatchEvent.mockImplementation( () => {
			throw new Error( 'dispatch failed' );
		} );

		// Act & Assert
		expect( () => {
			EditorOneEventManager.sendSidebarMenuItemClicked( { eventId: 'settings' } );
		} ).not.toThrow();
	} );

	test( 'sendSidebarMenuGroupToggled does not throw when dispatch fails', () => {
		// Arrange
		dispatchEvent.mockImplementation( () => {
			throw new Error( 'dispatch failed' );
		} );

		// Act & Assert
		expect( () => {
			EditorOneEventManager.sendSidebarMenuGroupToggled( {
				eventId: 'templates',
				isExpanded: true,
			} );
		} ).not.toThrow();
	} );
} );
