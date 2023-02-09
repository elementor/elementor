<?php
namespace Elementor\Core\Editor\Config_Providers;

use Elementor\Api;
use Elementor\Core\Debug\Loading_Inspection_Manager;
use Elementor\Core\Schemes\Manager as Schemes_Manager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Icons_Manager;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Shapes;
use Elementor\Tools;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_Common_Configs {
	public static function get_script_configs() {
		return [
			[
				'handle' => 'elementor-editor-modules',
				'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor-modules{{MIN_SUFFIX}}.js',
				'deps' => [ 'elementor-common-modules' ],
			],
			[
				'handle' => 'elementor-editor-document',
				'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor-document{{MIN_SUFFIX}}.js',
				'deps' => [ 'elementor-common-modules' ],
			],
			// Hack for waypoint with editor mode.
			[
				'handle' => 'elementor-waypoints',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/waypoints/waypoints-for-editor.js',
				'deps' => [ 'jquery' ],
				'version' => '4.0.2',
			],
			[
				'handle' => 'perfect-scrollbar',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/perfect-scrollbar/js/perfect-scrollbar{{MIN_SUFFIX}}.js',
				'version' => '1.4.0',
			],
			[
				'handle' => 'jquery-easing',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/jquery-easing/jquery-easing{{MIN_SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '1.3.2',
			],
			[
				'handle' => 'nprogress',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/nprogress/nprogress{{MIN_SUFFIX}}.js',
				'version' => '0.2.0',
			],
			[
				'handle' => 'tipsy',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/tipsy/tipsy{{MIN_SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '1.0.0',
			],
			[
				'handle' => 'jquery-elementor-select2',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/e-select2/js/e-select2.full{{MIN_SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '4.0.6-rc.1',
			],
			[
				'handle' => 'flatpickr',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/flatpickr/flatpickr{{MIN_SUFFIX}}.js',
				'deps' => [ 'jquery' ],
				'version' => '1.12.0',
			],
			[
				'handle' => 'ace',
				'src' => 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js',
				'version' => '1.2.5',
			],
			[
				'handle' => 'ace-language-tools',
				'src' => 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ext-language_tools.js',
				'deps' => [ 'ace' ],
				'version' => '1.2.5',
			],
			[
				'handle' => 'jquery-hover-intent',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/jquery-hover-intent/jquery-hover-intent{{MIN_SUFFIX}}.js',
				'version' => '1.0.0',
			],
			[
				'handle' => 'nouislider',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/nouislider/nouislider{{MIN_SUFFIX}}.js',
				'version' => '13.0.0',
			],
			[
				'handle' => 'pickr',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/pickr/pickr.min.js',
				'version' => '1.5.0',
			],
			[
				'handle' => 'elementor-editor',
				'src' => '{{ELEMENTOR_ASSETS_URL}}js/editor{{MIN_SUFFIX}}.js',
				'deps' => [
					'elementor-common',
					'elementor-editor-modules',
					'elementor-editor-document',
					'wp-auth-check',
					'jquery-ui-sortable',
					'jquery-ui-resizable',
					'perfect-scrollbar',
					'nprogress',
					'tipsy',
					'imagesloaded',
					'heartbeat',
					'jquery-elementor-select2',
					'flatpickr',
					'ace',
					'ace-language-tools',
					'jquery-hover-intent',
					'nouislider',
					'pickr',
					'react',
					'react-dom',
				],
				'i18n' => [
					'domain' => 'elementor',
				],
			],
		];
	}

	public static function get_style_configs() {
		return [
			[
				'handle' => 'font-awesome',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/font-awesome/css/font-awesome{{MIN_SUFFIX}}.css',
				'version' => '4.7.0',
			],
			[
				'handle' => 'elementor-select2',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/e-select2/css/e-select2{{MIN_SUFFIX}}.css',
				'version' => '4.0.6-rc.1',
			],
			[
				'handle' => 'google-font-roboto',
				'src' => 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
			],
			[
				'handle' => 'flatpickr',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/flatpickr/flatpickr{{MIN_SUFFIX}}.css',
				'version' => '1.12.0',
			],
			[
				'handle' => 'pickr',
				'src' => '{{ELEMENTOR_ASSETS_URL}}lib/pickr/themes/monolith.min.css',
				'version' => '1.5.0',
			],
			[
				'handle' => 'elementor-editor',
				'src' => '{{ELEMENTOR_ASSETS_URL}}css/editor{{DIRECTION_SUFFIX}}{{MIN_SUFFIX}}.css',
				'deps' => [
					'elementor-common',
					'elementor-select2',
					'elementor-icons',
					'wp-auth-check',
					'google-font-roboto',
					'flatpickr',
					'pickr',
				],
			],
		];
	}

	public static function get_client_settings() {
		$suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		$settings = SettingsManager::get_settings_managers_config();
		// Moved to document since 2.9.0.
		unset( $settings['page'] );

		$document = Plugin::$instance->documents->get_doc_or_auto_save( absint( $_REQUEST['post'] ?? 1 ) );
		$kits_manager = Plugin::$instance->kits_manager;

		$page_title_selector = $kits_manager->get_current_settings( 'page_title_selector' );

		$page_title_selector .= ', .elementor-page-title .elementor-heading-title';

		$config = [
			'initial_document' => $document->get_config(),
			'version' => ELEMENTOR_VERSION,
			'home_url' => home_url(),
			'admin_settings_url' => admin_url( 'admin.php?page=' . Settings::PAGE_ID ),
			'admin_tools_url' => admin_url( 'admin.php?page=' . Tools::PAGE_ID ),
			'autosave_interval' => AUTOSAVE_INTERVAL,
			'tabs' => Plugin::$instance->controls_manager->get_tabs(),
			'controls' => Plugin::$instance->controls_manager->get_controls_data(),
			'elements' => Plugin::$instance->elements_manager->get_element_types_config(),
			'schemes' => [
				'items' => Plugin::$instance->schemes_manager->get_registered_schemes_data(),
				'enabled_schemes' => Schemes_Manager::get_enabled_schemes(),
			],
			'globals' => [
				'defaults_enabled' => [
					'colors' => $kits_manager->is_custom_colors_enabled(),
					'typography' => $kits_manager->is_custom_typography_enabled(),
				],
			],
			'icons' => [
				'libraries' => Icons_Manager::get_icon_manager_tabs_config(),
				'goProURL' => 'https://go.elementor.com/go-pro-icon-library/',
			],
			'fa4_to_fa5_mapping_url' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/migration/mapping.js',
			'default_schemes' => Plugin::$instance->schemes_manager->get_schemes_defaults(),
			'settings' => $settings,
			'system_schemes' => Plugin::$instance->schemes_manager->get_system_schemes(),
			'wp_editor' => static::get_wp_editor_config(),
			'settings_page_link' => Settings::get_url(),
			'tools_page_link' => Tools::get_url(),
			'tools_page_nonce' => wp_create_nonce( 'tools-page-from-editor' ),
			'elementor_site' => 'https://go.elementor.com/about-elementor/',
			'docs_elementor_site' => 'https://go.elementor.com/docs/',
			'help_the_content_url' => 'https://go.elementor.com/the-content-missing/',
			'help_flexbox_bc_url' => 'https://go.elementor.com/flexbox-layout-bc/',
			'elementPromotionURL' => 'https://go.elementor.com/go-pro-%s',
			'dynamicPromotionURL' => 'https://go.elementor.com/go-pro-dynamic-tag',
			'additional_shapes' => Shapes::get_additional_shapes_for_config(),
			'user' => [
				'restrictions' => Plugin::$instance->role_manager->get_user_restrictions_array(),
				'is_administrator' => current_user_can( 'manage_options' ),
				'introduction' => User::get_introduction_meta(),
				'locale' => get_user_locale(),
			],
			'preview' => [
				'help_preview_error_url' => 'https://go.elementor.com/preview-not-loaded/',
				'help_preview_http_error_url' => 'https://go.elementor.com/preview-not-loaded/#permissions',
				'help_preview_http_error_500_url' => 'https://go.elementor.com/500-error/',
				'debug_data' => Loading_Inspection_Manager::instance()->run_inspections(),
			],
			'locale' => get_locale(),
			'rich_editing_enabled' => filter_var( get_user_meta( get_current_user_id(), 'rich_editing', true ), FILTER_VALIDATE_BOOLEAN ),
			'page_title_selector' => $page_title_selector,
			'tinymceHasCustomConfig' => class_exists( 'Tinymce_Advanced' ) || class_exists( 'Advanced_Editor_Tools' ),
			'inlineEditing' => Plugin::$instance->widgets_manager->get_inline_editing_config(),
			'dynamicTags' => Plugin::$instance->dynamic_tags->get_config(),
			'ui' => [
				'darkModeStylesheetURL' => ELEMENTOR_ASSETS_URL . 'css/editor-dark-mode' . $suffix . '.css',
				'defaultGenericFonts' => $kits_manager->get_current_settings( 'default_generic_fonts' ),
			],
			// Empty array for BC to avoid errors.
			'i18n' => [],
			// 'responsive' contains the custom breakpoints config introduced in Elementor v3.2.0
			'responsive' => [
				'breakpoints' => Plugin::$instance->breakpoints->get_breakpoints_config(),
				'icons_map' => Plugin::$instance->breakpoints->get_responsive_icons_classes_map(),
			],
			'promotion' => [
				'elements' => Plugin::$instance->editor->promotion->get_elements_promotion(),
			],
		];

		if ( ! Utils::has_pro() && current_user_can( 'manage_options' ) ) {
			$config['promotionWidgets'] = Api::get_promotion_widgets();
		}

		static::bc_move_document_filters();

		/**
		 * Localize editor settings.
		 *
		 * Filters the editor localized settings.
		 *
		 * @since 1.0.0
		 *
		 * @param array $config  Editor configuration.
		 * @param int   $post_id The ID of the current post being edited.
		 */
		$config = apply_filters( 'elementor/editor/localize_settings', $config );

		return [
			[
				'handle' => 'elementor-editor',
				'name' => 'ElementorConfig',
				'config' => $config,
			],
		];
	}

	private static function bc_move_document_filters() {
		global $wp_filter;

		$old_tag = 'elementor/editor/localize_settings';
		$new_tag = 'elementor/document/config';

		if ( ! has_filter( $old_tag ) ) {
			return;
		}

		foreach ( $wp_filter[ $old_tag ] as $priority => $filters ) {
			foreach ( $filters as $filter_id => $filter_args ) {
				if ( 2 === $filter_args['accepted_args'] ) {
					remove_filter( $old_tag, $filter_id, $priority );

					add_filter( $new_tag, $filter_args['function'], $priority, 2 );
				}
			}
		}
	}

	/**
	 * Get WordPress editor config.
	 *
	 * Config the default WordPress editor with custom settings for Elementor use.
	 *
	 * @since 1.9.0
	 * @access private
	 */
	private static function get_wp_editor_config() {
		// Remove all TinyMCE plugins.
		remove_all_filters( 'mce_buttons', 10 );
		remove_all_filters( 'mce_external_plugins', 10 );

		if ( ! class_exists( '\_WP_Editors', false ) ) {
			require ABSPATH . WPINC . '/class-wp-editor.php';
		}

		// WordPress 4.8 and higher
		if ( method_exists( '\_WP_Editors', 'print_tinymce_scripts' ) ) {
			\_WP_Editors::print_default_editor_scripts();
			\_WP_Editors::print_tinymce_scripts();
		}
		ob_start();

		wp_editor(
			'%%EDITORCONTENT%%',
			'elementorwpeditor',
			[
				'editor_class' => 'elementor-wp-editor',
				'editor_height' => 250,
				'drag_drop_upload' => true,
			]
		);

		$config = ob_get_clean();

		// Don't call \_WP_Editors methods again
		remove_action( 'admin_print_footer_scripts', [ '_WP_Editors', 'editor_js' ], 50 );
		remove_action( 'admin_print_footer_scripts', [ '_WP_Editors', 'print_default_editor_scripts' ], 45 );

		\_WP_Editors::editor_js();

		return $config;
	}
}
