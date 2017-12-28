<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings extends Settings_Page {

	const PAGE_ID = 'elementor';

	const MENU_PRIORITY_GO_PRO = 502;

	const UPDATE_TIME_FIELD = '_elementor_settings_update_time';

	const TAB_GENERAL = 'general';
	const TAB_STYLE = 'style';
	const TAB_INTEGRATIONS = 'integrations';
	const TAB_ADVANCED = 'advanced';

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function register_admin_menu() {
		add_menu_page(
			__( 'Elementor', 'elementor' ),
			__( 'Elementor', 'elementor' ),
			'manage_options',
			self::PAGE_ID,
			[ $this, 'display_settings_page' ],
			'',
			99
		);
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function register_pro_menu() {
		add_submenu_page(
			self::PAGE_ID,
			'',
			'<span class="dashicons dashicons-star-filled" style="font-size: 17px"></span> ' . __( 'Go Pro', 'elementor' ),
			'manage_options',
			'go_elementor_pro',
			[ $this, 'go_elementor_pro' ]
		);
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function go_elementor_pro() {
		if ( isset( $_GET['page'] ) && 'go_elementor_pro' === $_GET['page'] ) {
			wp_redirect( Utils::get_pro_link( 'https://elementor.com/pro/?utm_source=wp-menu&utm_campaign=gopro&utm_medium=wp-dash' ) );
			die;
		}
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function admin_menu_change_name() {
		global $submenu;

		if ( isset( $submenu['elementor'] ) ) {
			$submenu['elementor'][0][0] = __( 'Settings', 'elementor' );

			$hold_menu_data = $submenu['elementor'][0];
			$submenu['elementor'][0] = $submenu['elementor'][1];
			$submenu['elementor'][1] = $hold_menu_data;
		}
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function __construct() {
		parent::__construct();

		add_action( 'admin_init', [ $this, 'go_elementor_pro' ] );
		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 20 );
		add_action( 'admin_menu', [ $this, 'admin_menu_change_name' ], 200 );
		add_action( 'admin_menu', [ $this, 'register_pro_menu' ], self::MENU_PRIORITY_GO_PRO );

		// Clear CSS Meta after change print method.
		add_action( 'add_option_elementor_css_print_method', [ $this, 'update_css_print_method' ] );
		add_action( 'update_option_elementor_css_print_method', [ $this, 'update_css_print_method' ] );
	}

	/**
	 * @since 1.7.5
	 * @access public
	*/
	public function update_css_print_method() {
		Plugin::$instance->posts_css_manager->clear_cache();
	}

	/**
	 * @since 1.5.0
	 * @access protected
	*/
	protected function create_tabs() {
		$validations_class_name = __NAMESPACE__ . '\Settings_Validations';

		return [
			self::TAB_GENERAL => [
				'label' => __( 'General', 'elementor' ),
				'sections' => [
					'general' => [
						'fields' => [
							self::UPDATE_TIME_FIELD => [
								'full_field_id' => self::UPDATE_TIME_FIELD,
								'field_args' => [
									'type' => 'hidden',
								],
								'setting_args' => [
									'sanitize_callback' => 'time',
								],
							],
							'cpt_support' => [
								'label' => __( 'Post Types', 'elementor' ),
								'field_args' => [
									'type' => 'checkbox_list_cpt',
									'std' => [ 'page', 'post' ],
									'exclude' => [ 'attachment', 'elementor_library' ],
								],
								'setting_args' => [ $validations_class_name, 'checkbox_list' ],
							],
							'exclude_user_roles' => [
								'label' => __( 'Exclude Roles', 'elementor' ),
								'field_args' => [
									'type' => 'checkbox_list_roles',
									'exclude' => [ 'administrator' ],
								],
								'setting_args' => [ $validations_class_name, 'checkbox_list' ],
							],
							'disable_color_schemes' => [
								'label' => __( 'Disable Default Colors', 'elementor' ),
								'field_args' => [
									'type' => 'checkbox',
									'value' => 'yes',
									'sub_desc' => __( 'Checking this box will disable Elementor\'s Default Colors, and make Elementor inherit the colors from your theme.', 'elementor' ),
								],
							],
							'disable_typography_schemes' => [
								'label' => __( 'Disable Default Fonts', 'elementor' ),
								'field_args' => [
									'type' => 'checkbox',
									'value' => 'yes',
									'sub_desc' => __( 'Checking this box will disable Elementor\'s Default Fonts, and make Elementor inherit the fonts from your theme.', 'elementor' ),
								],
							],
						],
					],
					'usage' => [
						'label' => __( 'Improve Elementor', 'elementor' ),
						'fields' => [
							'allow_tracking' => [
								'label' => __( 'Usage Data Tracking', 'elementor' ),
								'field_args' => [
									'type' => 'checkbox',
									'value' => 'yes',
									'default' => '',
									'sub_desc' => __( 'Opt-in to our anonymous plugin data collection and to updates. We guarantee no sensitive data is collected.', 'elementor' ) . sprintf( ' <a href="%s" target="_blank">%s</a>', 'https://go.elementor.com/usage-data-tracking/', __( 'Learn more.', 'elementor' ) ),
								],
								'setting_args' => [ __NAMESPACE__ . '\Tracker', 'check_for_settings_optin' ],
							],
						],
					],
				],
			],
			self::TAB_STYLE => [
				'label' => __( 'Style', 'elementor' ),
				'sections' => [
					'style' => [
						'fields' => [
							'default_generic_fonts' => [
								'label' => __( 'Default Generic Fonts', 'elementor' ),
								'field_args' => [
									'type' => 'text',
									'std' => 'Sans-serif',
									'class' => 'medium-text',
									'desc' => __( 'The list of fonts used if the chosen font is not available.', 'elementor' ),
								],
							],
							'container_width' => [
								'label' => __( 'Content Width', 'elementor' ),
								'field_args' => [
									'type' => 'text',
									'placeholder' => '1140',
									'sub_desc' => 'px',
									'class' => 'medium-text',
									'desc' => __( 'Sets the default width of the content area (Default: 1140)', 'elementor' ),
								],
							],
							'space_between_widgets' => [
								'label' => __( 'Space Between Widgets', 'elementor' ),
								'field_args' => [
									'type' => 'text',
									'placeholder' => '20',
									'sub_desc' => 'px',
									'class' => 'medium-text',
									'desc' => __( 'Sets the default space between widgets (Default: 20)', 'elementor' ),
								],
							],
							'stretched_section_container' => [
								'label' => __( 'Stretched Section Fit To', 'elementor' ),
								'field_args' => [
									'type' => 'text',
									'placeholder' => 'body',
									'class' => 'medium-text',
									'desc' => __( 'Enter parent element selector to which stretched sections will fit to (e.g. #primary / .wrapper / main etc). Leave blank to fit to page width.', 'elementor' ),
								],
							],
							'page_title_selector' => [
								'label' => __( 'Page Title Selector', 'elementor' ),
								'field_args' => [
									'type' => 'text',
									'placeholder' => 'h1.entry-title',
									'class' => 'medium-text',
									'desc' => __( 'Elementor lets you hide the page title. This works for themes that have "h1.entry-title" selector. If your theme\'s selector is different, please enter it above.', 'elementor' ),
								],
							],
							'global_image_lightbox' => [
								'label' => __( 'Image Lightbox', 'elementor' ),
								'field_args' => [
									'type' => 'checkbox',
									'value' => 'yes',
									'std' => 'yes',
									'sub_desc' => __( 'Open all image links in a lightbox popup window. The lightbox will automatically work on any link that leads to an image file.', 'elementor' ),
									'desc' => __( 'You can customize the lightbox design by going to: Top-left hamburger icon > Global Settings > Lightbox.', 'elementor' ),
								],
							],
						],
					],
				],
			],
			self::TAB_INTEGRATIONS => [
				'label' => __( 'Integrations', 'elementor' ),
				'sections' => [],
			],
			self::TAB_ADVANCED => [
				'label' => __( 'Advanced', 'elementor' ),
				'sections' => [
					'advanced' => [
						'fields' => [
							'css_print_method' => [
								'label' => __( 'CSS Print Method', 'elementor' ),
								'field_args' => [
									'class' => 'elementor_css_print_method',
									'type' => 'select',
									'options' => [
										'external' => __( 'External File', 'elementor' ),
										'internal' => __( 'Internal Embedding', 'elementor' ),
									],
									'desc' => '<div class="elementor-css-print-method-description" data-value="external" style="display: none">' .
											  __( 'Use external CSS files for all generated stylesheets. Choose this setting for better performance (recommended).', 'elementor' ) .
											  '</div>' .
											  '<div class="elementor-css-print-method-description" data-value="internal" style="display: none">' .
											  __( 'Use internal CSS that is embedded in the head of the page. For troubleshooting server configuration conflicts and managing development environments.', 'elementor' ) .
											  '</div>',
								],
							],
							'editor_break_lines' => [
								'label' => __( 'Switch Editor Loader Method', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'options' => [
										'' => __( 'Disable', 'elementor' ),
										1 => __( 'Enable', 'elementor' ),
									],
									'desc' => __( 'For troubleshooting server configuration conflicts.', 'elementor' ),
								],
							],
						],
					],
				],
			],
		];
	}

	/**
	 * @since 1.5.0
	 * @access protected
	*/
	protected function get_page_title() {
		return __( 'Elementor', 'elementor' );
	}
}
