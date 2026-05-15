<?php
namespace Elementor;

use Elementor\Core\Files\Fonts\Google_Font;
use Elementor\Modules\Promotions\Module as Promotions_Module;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Includes\Settings\AdminMenuItems\Editor_One_Home_Menu;
use Elementor\Includes\Settings\AdminMenuItems\Editor_One_Settings_Menu;

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
	 * Settings page integrations tab slug.
	 */
	const TAB_INTEGRATIONS = 'integrations';

	/**
	 * Settings page advanced tab slug.
	 */
	const TAB_ADVANCED = 'advanced';

	/**
	 * Settings page performance tab slug.
	 */
	const TAB_PERFORMANCE = 'performance';

	const ADMIN_MENU_PRIORITY = 10;

	const MENU_CAPABILITY_EDIT_POSTS = 'edit_posts';

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
		if ( ! current_user_can( self::MENU_CAPABILITY_EDIT_POSTS ) ) {
			return;
		}

		add_menu_page(
			esc_html__( 'Elementor', 'elementor' ),
			esc_html__( 'Elementor', 'elementor' ),
			self::MENU_CAPABILITY_EDIT_POSTS,
			self::PAGE_ID,
			[ $this, 'display_home_screen' ],
			'',
			'58.5'
		);
	}

	public function display_home_screen() {
		echo '<div id="e-home-screen"></div>';
	}

	private function register_editor_one_settings_menu( Menu_Data_Provider $menu_data_provider ) {
		$menu_data_provider->register_menu( new Editor_One_Settings_Menu() );
	}

	private function register_editor_one_home_menu( Menu_Data_Provider $menu_data_provider ) {
		$menu_data_provider->register_menu( new Editor_One_Home_Menu() );
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
		$this->maybe_remove_all_admin_notices();
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
	 * @deprecated 3.0.0 Use `Plugin::$instance->files_manager->clear_cache()` method instead.
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
						'label' => esc_html__( 'General', 'elementor' ),
						'callback' => function() {
							printf(
								'<p>%s</p><br><hr><br>',
								esc_html__( 'Tailor how Elementor enhances your site, from post types to other functions.', 'elementor' )
							);
						},
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
						'label' => esc_html__( 'Advanced', 'elementor' ),
						'callback' => function() {
							printf(
								'<p>%s</p><br><hr><br>',
								esc_html__( 'Personalize the way Elementor works on your website by choosing the advanced features and how they operate.', 'elementor' )
							);
						},
						'fields' => [
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
										/* translators: 1: Link opening tag, 2: Link closing tag */
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
									'desc' => esc_html__( 'Font-display property defines how font files are loaded and displayed by the browser.', 'elementor' ) . '<br>' . esc_html__( 'Set the way Google Fonts are being loaded by selecting the font-display property (Recommended: Swap).', 'elementor' ),
								],
							],
						],
					],
				],
			],
			self::TAB_PERFORMANCE => [
				'label' => esc_html__( 'Performance', 'elementor' ),
				'sections' => [
					'performance' => [
						'label' => esc_html__( 'Performance', 'elementor' ),
						'callback' => function() {
							printf(
								'<p>%s</p><br><hr><br>',
								esc_html__( 'Improve loading times on your site by selecting the optimization tools that best fit your requirements.', 'elementor' )
							);
						},
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
									'desc' => sprintf(
										/* translators: %s: <head> tag. */
										esc_html__( 'Internal Embedding places all CSS in the %s which works great for troubleshooting, while External File uses external CSS file for better performance (recommended).', 'elementor' ),
										'<code>&lt;head&gt;</code>',
									),
								],
							],
							'optimized_image_loading' => [
								'label' => esc_html__( 'Optimized Image Loading', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => '1',
									'options' => [
										'1' => esc_html__( 'Enable', 'elementor' ),
										'0' => esc_html__( 'Disable', 'elementor' ),
									],
									'desc' => sprintf(
										/* translators: 1: fetchpriority attribute, 2: lazy loading attribute. */
										esc_html__( 'Improve performance by applying %1$s on LCP image and %2$s on images below the fold.', 'elementor' ),
										'<code>fetchpriority="high"</code>',
										'<code>loading="lazy"</code>'
									),
								],
							],
							'optimized_gutenberg_loading' => [
								'label' => esc_html__( 'Optimized Gutenberg Loading', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => '1',
									'options' => [
										'1' => esc_html__( 'Enable', 'elementor' ),
										'0' => esc_html__( 'Disable', 'elementor' ),
									],
									'desc' => esc_html__( 'Reduce unnecessary render-blocking loads by dequeuing unused Gutenberg block editor scripts and styles.', 'elementor' ),
								],
							],
							'lazy_load_background_images' => [
								'label' => esc_html__( 'Lazy Load Background Images', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => '1',
									'options' => [
										'1' => esc_html__( 'Enable', 'elementor' ),
										'0' => esc_html__( 'Disable', 'elementor' ),
									],
									'desc' => esc_html__( 'Improve initial page load performance by lazy loading all background images except the first one.', 'elementor' ),
								],
							],
							'local_google_fonts' => [
								'label' => esc_html__( 'Load Google Fonts Locally', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => '0',
									'options' => [
										'1' => esc_html__( 'Enable', 'elementor' ),
										'0' => esc_html__( 'Disable', 'elementor' ),
									],
									'desc' => esc_html__( 'Load Google fonts locally to benefit from faster performance and ensure GDPR compliance. Fonts will be served from your own server instead of Google’s. Only the very first load (in the editor and on the front end) may take slightly longer.', 'elementor' ),
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
		return esc_html__( 'Elementor', 'elementor' );
	}

	/**
	 * @since 2.2.0
	 * @access private
	 */
	private function maybe_remove_all_admin_notices() {
		$elementor_pages = [
			'elementor-system-info',
			'e-form-submissions',
			'elementor_custom_fonts',
			'elementor_custom_icons',
			'elementor-license',
			'elementor_custom_code',
			'popup_templates',
			'elementor-apps',
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

		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 20 );

		add_action( 'elementor/editor-one/menu/register', function ( Menu_Data_Provider $menu_data_provider ) {
			$this->register_editor_one_settings_menu( $menu_data_provider );
			$this->register_editor_one_home_menu( $menu_data_provider );
		} );

		$clear_cache_callback = [ Plugin::$instance->files_manager, 'clear_cache' ];

		// Clear CSS Meta after change css related methods.
		$css_settings = [
			'elementor_disable_color_schemes',
			'elementor_disable_typography_schemes',
			'elementor_css_print_method',
			'elementor_local_google_fonts',
		];

		foreach ( $css_settings as $option_name ) {
			add_action( "add_option_{$option_name}", $clear_cache_callback );
			add_action( "update_option_{$option_name}", $clear_cache_callback );
		}

		add_action( 'update_option_elementor_font_display', [ Google_Font::class, 'clear_cache' ] );
	}
}
