<?php
namespace Elementor;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Includes\Settings\AdminMenuItems\Admin_Menu_Item;
use Elementor\Includes\Settings\AdminMenuItems\Get_Help_Menu_Item;
use Elementor\Includes\Settings\AdminMenuItems\Getting_Started_Menu_Item;
use Elementor\Modules\Promotions\Module as Promotions_Module;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor "Settings" page in WordPress Dashboard.
 *
 * Elementor settings page handler class responsible for creating and displaying
 * Elementor "Settings" page in WordPress dashboard.
 *
 * @since 1.0.0
 */
class Settings extends Settings_Page {

	/**
	 * Settings page ID for Elementor settings.
	 */
	const PAGE_ID = 'elementor';

	/**
	 * Upgrade menu priority.
	 */
	const MENU_PRIORITY_GO_PRO = 502;

	/**
	 * Settings page field for update time.
	 */
	const UPDATE_TIME_FIELD = '_elementor_settings_update_time';

	/**
	 * Settings page general tab slug.
	 */
	const TAB_GENERAL = 'general';

	/**
	 * Settings page style tab slug.
	 */
	const TAB_STYLE = 'style';

	/**
	 * Settings page integrations tab slug.
	 */
	const TAB_INTEGRATIONS = 'integrations';

	/**
	 * Settings page advanced tab slug.
	 */
	const TAB_ADVANCED = 'advanced';

	const ADMIN_MENU_PRIORITY = 10;

	/**
	 * Register admin menu.
	 *
	 * Add new Elementor Settings admin menu.
	 *
	 * Fired by `admin_menu` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function register_admin_menu() {
		global $menu;

		$menu[] = [ '', 'read', 'separator-elementor', '', 'wp-menu-separator elementor' ]; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		add_menu_page(
			esc_html__( 'Elementor', 'elementor' ),
			esc_html__( 'Elementor', 'elementor' ),
			'manage_options',
			self::PAGE_ID,
			[ $this, 'display_settings_page' ],
			'',
			'58.5'
		);
	}

	/**
	 * Reorder the Elementor menu items in admin.
	 * Based on WC.
	 *
	 * @since 2.4.0
	 *
	 * @param array $menu_order Menu order.
	 * @return array
	 */
	public function menu_order( $menu_order ) {
		// Initialize our custom order array.
		$elementor_menu_order = [];

		// Get the index of our custom separator.
		$elementor_separator = array_search( 'separator-elementor', $menu_order, true );

		// Get index of library menu.
		$elementor_library = array_search( Source_Local::ADMIN_MENU_SLUG, $menu_order, true );

		// Loop through menu order and do some rearranging.
		foreach ( $menu_order as $index => $item ) {
			if ( 'elementor' === $item ) {
				$elementor_menu_order[] = 'separator-elementor';
				$elementor_menu_order[] = $item;
				$elementor_menu_order[] = Source_Local::ADMIN_MENU_SLUG;

				unset( $menu_order[ $elementor_separator ] );
				unset( $menu_order[ $elementor_library ] );
			} elseif ( ! in_array( $item, [ 'separator-elementor' ], true ) ) {
				$elementor_menu_order[] = $item;
			}
		}

		// Return order.
		return $elementor_menu_order;
	}

	/**
	 * Register Elementor knowledge base sub-menu.
	 *
	 * Add new Elementor knowledge base sub-menu under the main Elementor menu.
	 *
	 * Fired by `admin_menu` action.
	 *
	 * @since 2.0.3
	 * @access private
	 */
	private function register_knowledge_base_menu( Admin_Menu_Manager $admin_menu ) {
		$admin_menu->register( 'elementor-getting-started', new Getting_Started_Menu_Item() );
		$admin_menu->register( 'go_knowledge_base_site', new Get_Help_Menu_Item() );
	}

	/**
	 * Go Elementor Pro.
	 *
	 * Redirect the Elementor Pro page the clicking the Elementor Pro menu link.
	 *
	 * Fired by `admin_init` action.
	 *
	 * @since 2.0.3
	 * @access public
	 */
	public function handle_external_redirects() {
		if ( empty( $_GET['page'] ) ) {
			return;
		}

		if ( 'go_knowledge_base_site' === $_GET['page'] ) {
			wp_redirect( Get_Help_Menu_Item::URL );
			die;
		}
	}

	/**
	 * On admin init.
	 *
	 * Preform actions on WordPress admin initialization.
	 *
	 * Fired by `admin_init` action.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function on_admin_init() {
		$this->handle_external_redirects();

		$this->maybe_remove_all_admin_notices();
	}

	/**
	 * Change "Settings" menu name.
	 *
	 * Update the name of the Settings admin menu from "Elementor" to "Settings".
	 *
	 * Fired by `admin_menu` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function admin_menu_change_name() {
		Utils::change_submenu_first_item_label( 'elementor', esc_html__( 'Settings', 'elementor' ) );
	}

	/**
	 * Update CSS print method.
	 *
	 * Clear post CSS cache.
	 *
	 * Fired by `add_option_elementor_css_print_method` and
	 * `update_option_elementor_css_print_method` actions.
	 *
	 * @since 1.7.5
	 * @access public
	 * @deprecated 3.0.0
	 */
	public function update_css_print_method() {
		Plugin::$instance->files_manager->clear_cache();
	}

	/**
	 * Create tabs.
	 *
	 * Return the settings page tabs, sections and fields.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @return array An array with the settings page tabs, sections and fields.
	 */
	protected function create_tabs() {
		$validations_class_name = __NAMESPACE__ . '\Settings_Validations';

		return [
			self::TAB_GENERAL => [
				'label' => esc_html__( 'General', 'elementor' ),
				'sections' => [
					'general' => [
						'fields' => [
							self::UPDATE_TIME_FIELD => [
								'full_field_id' => self::UPDATE_TIME_FIELD,
								'field_args' => [
									'type' => 'hidden',
								],
								'setting_args' => [ $validations_class_name, 'current_time' ],
							],
							'cpt_support' => [
								'label' => esc_html__( 'Post Types', 'elementor' ),
								'field_args' => [
									'type' => 'checkbox_list_cpt',
									'std' => [ 'page', 'post' ],
									'exclude' => [ 'attachment', 'elementor_library' ],
								],
								'setting_args' => [ $validations_class_name, 'checkbox_list' ],
							],
							'disable_color_schemes' => [
								'label' => esc_html__( 'Disable Default Colors', 'elementor' ),
								'field_args' => [
									'type' => 'checkbox',
									'value' => 'yes',
									'sub_desc' => esc_html__( 'Checking this box will disable Elementor\'s Default Colors, and make Elementor inherit the colors from your theme.', 'elementor' ),
								],
							],
							'disable_typography_schemes' => [
								'label' => esc_html__( 'Disable Default Fonts', 'elementor' ),
								'field_args' => [
									'type' => 'checkbox',
									'value' => 'yes',
									'sub_desc' => esc_html__( 'Checking this box will disable Elementor\'s Default Fonts, and make Elementor inherit the fonts from your theme.', 'elementor' ),
								],
							],
						],
					],
					'usage' => [
						'label' => esc_html__( 'Improve Elementor', 'elementor' ),
						'fields' => $this->get_usage_fields(),
					],
				],
			],
			self::TAB_INTEGRATIONS => [
				'label' => esc_html__( 'Integrations', 'elementor' ),
				'sections' => [
					'google_maps' => [
						'label' => esc_html__( 'Google Maps Embed API', 'elementor' ),
						'callback' => function() {
							printf(
								/* translators: 1: Link open tag, 2: Link close tag */
								esc_html__( 'Google Maps Embed API is a free service by Google that allows embedding Google Maps in your site. For more details, visit Google Maps\' %1$sUsing API Keys%2$s page.', 'elementor' ),
								'<a target="_blank" href="https://developers.google.com/maps/documentation/embed/get-api-key">',
								'</a>'
							);
						},
						'fields' => [
							'google_maps_api_key' => [
								'label' => esc_html__( 'API Key', 'elementor' ),
								'field_args' => [
									'class' => 'elementor_google_maps_api_key',
									'type' => 'text',
								],
							],
						],
					],
				],
			],
			self::TAB_ADVANCED => [
				'label' => esc_html__( 'Advanced', 'elementor' ),
				'sections' => [
					'advanced' => [
						'fields' => [
							'css_print_method' => [
								'label' => esc_html__( 'CSS Print Method', 'elementor' ),
								'field_args' => [
									'class' => 'elementor_css_print_method',
									'type' => 'select',
									'std' => 'external',
									'options' => [
										'external' => esc_html__( 'External File', 'elementor' ),
										'internal' => esc_html__( 'Internal Embedding', 'elementor' ),
									],
									'desc' => '<div class="elementor-css-print-method-description" data-value="external" style="display: none">' . esc_html__( 'Use external CSS files for all generated stylesheets. Choose this setting for better performance (recommended).', 'elementor' ) . '</div><div class="elementor-css-print-method-description" data-value="internal" style="display: none">' . esc_html__( 'Use internal CSS that is embedded in the head of the page. For troubleshooting server configuration conflicts and managing development environments.', 'elementor' ) . '</div>',
								],
							],
							'editor_break_lines' => [
								'label' => esc_html__( 'Switch Editor Loader Method', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => '',
									'options' => [
										'' => esc_html__( 'Disable', 'elementor' ),
										'1' => esc_html__( 'Enable', 'elementor' ),
									],
									'desc' => esc_html__( 'For troubleshooting server configuration conflicts.', 'elementor' ),
								],
							],
							'unfiltered_files_upload' => [
								'label' => esc_html__( 'Enable Unfiltered File Uploads', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => '',
									'options' => [
										'' => esc_html__( 'Disable', 'elementor' ),
										'1' => esc_html__( 'Enable', 'elementor' ),
									],
									'desc' => esc_html__( 'Please note! Allowing uploads of any files (SVG & JSON included) is a potential security risk.', 'elementor' ) . '<br>' . esc_html__( 'Elementor will try to sanitize the unfiltered files, removing potential malicious code and scripts.', 'elementor' ) . '<br>' . esc_html__( 'We recommend you only enable this feature if you understand the security risks involved.', 'elementor' ),
								],
							],
							'google_font' => [
								'label' => esc_html__( 'Google Fonts', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => '1',
									'options' => [
										'1' => esc_html__( 'Enable', 'elementor' ),
										'0' => esc_html__( 'Disable', 'elementor' ),
									],
									'desc' => sprintf(
										esc_html__( 'Disable this option if you want to prevent Google Fonts from being loaded. This setting is recommended when loading fonts from a different source (plugin, theme or %1$scustom fonts%2$s).', 'elementor' ),
										'<a href="' . admin_url( 'admin.php?page=elementor_custom_fonts' ) . '">',
										'</a>'
									),
								],
							],
							'font_display' => [
								'label' => esc_html__( 'Google Fonts Load', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => 'auto',
									'options' => [
										'auto' => esc_html__( 'Default', 'elementor' ),
										'block' => esc_html__( 'Blocking', 'elementor' ),
										'swap' => esc_html__( 'Swap', 'elementor' ),
										'fallback' => esc_html__( 'Fallback', 'elementor' ),
										'optional' => esc_html__( 'Optional', 'elementor' ),
									],
									'desc' => esc_html__( 'Font-display property defines how font files are loaded and displayed by the browser.', 'elementor' ) . '<br>' . esc_html__( 'Set the way Google Fonts are being loaded by selecting the font-display property (Default: Auto).', 'elementor' ),
								],
							],
						],
					],
				],
			],
		];
	}

	/**
	 * Get settings page title.
	 *
	 * Retrieve the title for the settings page.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @return string Settings page title.
	 */
	protected function get_page_title() {
		if ( Plugin::$instance->experiments->is_feature_active( 'admin_menu_rearrangement' ) ) {
			return esc_html__( 'Settings', 'elementor' );
		}

		return esc_html__( 'Elementor', 'elementor' );
	}

	/**
	 * @since 2.2.0
	 * @access private
	 */
	private function maybe_remove_all_admin_notices() {
		$elementor_pages = [
			'elementor-getting-started',
			'elementor_custom_fonts',
			'elementor_custom_icons',
			'elementor-license',
			'elementor_custom_custom_code',
			'popup_templates',
		];

		if ( empty( $_GET['page'] ) || ! in_array( $_GET['page'], $elementor_pages, true ) ) {
			return;
		}

		remove_all_actions( 'admin_notices' );
	}

	public function add_generator_tag_settings( $settings ) {
		$css_print_method = get_option( 'elementor_css_print_method', 'external' );
		$settings[] = 'css_print_method-' . $css_print_method;

		$google_font = Fonts::is_google_fonts_enabled() ? 'enabled' : 'disabled';
		$settings[] = 'google_font-' . $google_font;

		$font_display = Fonts::get_font_display_setting();
		$settings[] = 'font_display-' . $font_display;

		return $settings;
	}

	/**
	 * Settings page constructor.
	 *
	 * Initializing Elementor "Settings" page.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		parent::__construct();

		add_action( 'admin_init', [ $this, 'on_admin_init' ] );
		add_filter( 'elementor/generator_tag/settings', [ $this, 'add_generator_tag_settings' ] );

		if ( ! Plugin::$instance->experiments->is_feature_active( 'admin_menu_rearrangement' ) ) {
			add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 20 );

			add_action( 'elementor/admin/menu/register', function ( Admin_Menu_Manager $admin_menu ) {
				$this->register_knowledge_base_menu( $admin_menu );
			}, Promotions_Module::ADMIN_MENU_PRIORITY - 1 );

			add_action( 'admin_menu', [ $this, 'admin_menu_change_name' ], 200 );

			add_filter( 'custom_menu_order', '__return_true' );
			add_filter( 'menu_order', [ $this, 'menu_order' ] );
		}

		$clear_cache_callback = [ Plugin::$instance->files_manager, 'clear_cache' ];

		// Clear CSS Meta after change css related methods.
		$css_settings = [
			'elementor_disable_color_schemes',
			'elementor_disable_typography_schemes',
			'elementor_css_print_method',
		];

		foreach ( $css_settings as $option_name ) {
			add_action( "add_option_{$option_name}", $clear_cache_callback );
			add_action( "update_option_{$option_name}", $clear_cache_callback );
		}
	}
}
