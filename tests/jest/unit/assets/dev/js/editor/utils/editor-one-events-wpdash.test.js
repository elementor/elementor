import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';

describe( 'EditorOneEventManager wpdash menu events', () => {
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

	test( 'sendWpDashElementorMenuClick dispatches the elementor menu click descriptor', () => {
		// Act
		EditorOneEventManager.sendWpDashElementorMenuClick();

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'wpdash_elementor_menu_click', {
			window_name: 'wpdash',
			interaction_type: 'click',
			target_type: 'wpdash_admin_menu_item',
			target_name: 'elementor_menu_item',
			interaction_result: 'elementor_side_menu_opened',
			target_location: 'wpdash_admin',
			location_l1: 'elementor_editor_core_menu',
			location_l2: '',
			interaction_description: 'core_user_clicked_elementor_menu_item',
		} );
	} );

	test( 'sendWpDashEditorSubMenuHover dispatches the editor sub menu hover descriptor', () => {
		// Act
		EditorOneEventManager.sendWpDashEditorSubMenuHover();

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'wpdash_editor_sub_menu_hover', {
			window_name: 'wpdash',
			interaction_type: 'hover',
			target_type: 'wpdash_editor_menu',
			target_name: 'wpdash_editor_sub_menu',
			interaction_result: 'wpdash_editor_sub_menu_opened',
			target_location: 'wpdash_admin',
			location_l1: 'elementor_editor_core_sub_menu',
			location_l2: '',
			interaction_description: 'core_user_hovered_sub_menu',
		} );
	} );

	test( 'sendWpDashThemeBuilderClick dispatches the theme builder click descriptor', () => {
		// Act
		EditorOneEventManager.sendWpDashThemeBuilderClick();

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith( 'wpdash_theme_builder_click', {
			window_name: 'wpdash',
			interaction_type: 'click',
			target_type: 'wpdash_sub_menu_item',
			target_name: 'theme_builder_menu_item',
			interaction_result: 'theme_builder_promotion_window',
			target_location: 'wpdash_admin',
			location_l1: 'wpdash_core_sub_menu_theme_builder',
			location_l2: '',
			interaction_description: 'core_user_clicked_theme_builder_menu_item',
		} );
	} );

	test( 'does not dispatch when events cannot be sent', () => {
		// Arrange
		window.elementorCommon.config.editor_events.can_send_events = false;

		// Act
		EditorOneEventManager.sendWpDashElementorMenuClick();

		// Assert
		expect( dispatchEvent ).not.toHaveBeenCalled();
	} );
} );
