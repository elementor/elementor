<?php
namespace Elementor;

use Elementor\Core\Responsive\Responsive;
use Elementor\Core\Settings\General\Manager as General_Settings_Manager;
use Elementor\Core\Settings\Manager;

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
	 * Go Pro menu priority.
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
	 * Register Elementor Pro sub-menu.
	 *
	 * Add new Elementor Pro sub-menu under the main Elementor menu.
	 *
	 * Fired by `admin_menu` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function register_pro_menu() {
		add_submenu_page(
			self::PAGE_ID,
			__( 'Custom Fonts', 'elementor' ),
			__( 'Custom Fonts', 'elementor' ),
			'manage_options',
			'elementor_custom_fonts',
			[ $this, 'elementor_custom_fonts' ]
		);

		add_submenu_page(
			self::PAGE_ID,
			'',
			'<span class="dashicons dashicons-star-filled" style="font-size: 17px"></span> ' . __( 'Go Pro', 'elementor' ),
			'manage_options',
			'go_elementor_pro',
			[ $this, 'handle_external_redirects' ]
		);
	}

	/**
	 * Register Elementor knowledge base sub-menu.
	 *
	 * Add new Elementor knowledge base sub-menu under the main Elementor menu.
	 *
	 * Fired by `admin_menu` action.
	 *
	 * @since 2.0.3
	 * @access public
	 */
	public function register_knowledge_base_menu() {
		add_submenu_page(
			self::PAGE_ID,
			'',
			__( 'Getting Started', 'elementor' ),
			'manage_options',
			'elementor-getting-started',
			[ $this, 'elementor_getting_started' ]
		);

		add_submenu_page(
			self::PAGE_ID,
			'',
			__( 'Knowledge Base', 'elementor' ),
			'manage_options',
			'go_knowledge_base_site',
			[ $this, 'handle_external_redirects' ]
		);
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

		if ( 'go_elementor_pro' === $_GET['page'] ) {
			wp_redirect( Utils::get_pro_link( 'https://elementor.com/pro/?utm_source=wp-menu&utm_campaign=gopro&utm_medium=wp-dash' ) );
			die;
		}

		if ( 'go_knowledge_base_site' === $_GET['page'] ) {
			wp_redirect( 'https://go.elementor.com/docs-admin-menu/' );
			die;
		}
	}

	/**
	 * Display settings page.
	 *
	 * Output the content for the getting started page.
	 *
	 * @since 2.2.0
	 * @access public
	 */
	public function elementor_getting_started() {
		if ( User::is_current_user_can_edit_post_type( 'page' ) ) {
			$create_new_label = __( 'Create Your First Page', 'elementor' );
			$create_new_cpt = 'page';
		} elseif ( User::is_current_user_can_edit_post_type( 'post' ) ) {
			$create_new_label = __( 'Create Your First Post', 'elementor' );
			$create_new_cpt = 'post';
		}

		?>
		<div class="wrap">
			<div class="e-getting-started">
				<div class="e-getting-started__box postbox">
					<div class="e-getting-started__header">
						<div class="e-getting-started__title">
							<div class="e-logo-wrapper"><i class="eicon-elementor"></i></div>

							<?php echo __( 'Getting Started', 'elementor' ); ?>
						</div>
						<a class="e-getting-started__skip" href="<?php echo esc_url( admin_url() ); ?>">
							<i class="eicon-close" aria-hidden="true" title="<?php esc_attr_e( 'Skip', 'elementor' ); ?>"></i>
							<span class="elementor-screen-only"><?php echo __( 'Skip', 'elementor' ); ?></span>
						</a>
					</div>
					<div class="e-getting-started__content">
						<div class="e-getting-started__content--narrow">
							<h2><?php echo __( 'Welcome to Elementor', 'elementor' ); ?></h2>
							<p><?php echo __( 'We recommend you watch this 2 minute getting started video, and then try the editor yourself by dragging and dropping elements to create your first page.', 'elementor' ); ?></p>
						</div>

						<div class="e-getting-started__video">
							<iframe width="620" height="350" src="https://www.youtube-nocookie.com/embed/-TPpwuB6dnI?rel=0&amp;controls=1&amp;showinfo=0&amp;modestbranding=1" frameborder="0" allowfullscreen></iframe>
						</div>

						<div class="e-getting-started__actions e-getting-started__content--narrow">
							<?php if ( ! empty( $create_new_cpt ) ) : ?>
							<a href="<?php echo esc_url( Utils::get_create_new_post_url( $create_new_cpt ) ); ?>" class="button button-primary button-hero"><?php echo esc_html( $create_new_label ); ?></a>
							<?php endif; ?>

							<a href="https://go.elementor.com/getting-started/" target="_blank" class="button button-secondary button-hero"><?php echo __( 'Read the Full Article', 'elementor' ); ?></a>
						</div>
					</div>
				</div>
			</div>
		</div><!-- /.wrap -->
		<?php
	}

	/**
	 * Display settings page.
	 *
	 * Output the content for the custom fonts page.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function elementor_custom_fonts() {
		?>
		<div class="wrap">
			<div class="elementor-blank_state">
				<i class="eicon-nerd-chuckle"></i>
				<h2><?php echo __( 'Add Your Custom Fonts', 'elementor' ); ?></h2>
				<p><?php echo __( 'Custom Fonts allows you to add your self-hosted fonts and use them on your Elementor projects to create a unique brand language.', 'elementor' ); ?></p>
				<a class="elementor-button elementor-button-default elementor-button-go-pro" target="_blank" href="<?php echo Utils::get_pro_link( 'https://elementor.com/pro/?utm_source=wp-custom-fonts&utm_campaign=gopro&utm_medium=wp-dash' ); ?>"><?php echo __( 'Go Pro', 'elementor' ); ?></a>
			</div>
		</div><!-- /.wrap -->
		<?php
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

		// Save general settings in one list for a future usage
		$this->handle_general_settings_update();

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
		global $submenu;

		if ( isset( $submenu['elementor'] ) ) {
			// @codingStandardsIgnoreStart
			$submenu['elementor'][0][0] = __( 'Settings', 'elementor' );

			$hold_menu_data = $submenu['elementor'][0];
			$submenu['elementor'][0] = $submenu['elementor'][1];
			$submenu['elementor'][1] = $hold_menu_data;
			// @codingStandardsIgnoreEnd
		}
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

		$default_breakpoints = Responsive::get_default_breakpoints();

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
									'sub_desc' => __( 'Opt-in to our anonymous plugin data collection and to updates. We guarantee no sensitive data is collected.', 'elementor' ) . sprintf( ' <a href="%1$s" target="_blank">%2$s</a>', 'https://go.elementor.com/usage-data-tracking/', __( 'Learn more.', 'elementor' ) ),
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
									'type' => 'number',
									'attributes' => [
										'placeholder' => '1140',
										'class' => 'medium-text',
									],
									'sub_desc' => 'px',
									'desc' => __( 'Sets the default width of the content area (Default: 1140)', 'elementor' ),
								],
							],
							'space_between_widgets' => [
								'label' => __( 'Space Between Widgets', 'elementor' ),
								'field_args' => [
									'type' => 'number',
									'attributes' => [
										'placeholder' => '20',
										'class' => 'medium-text',
									],
									'sub_desc' => 'px',
									'desc' => __( 'Sets the default space between widgets (Default: 20)', 'elementor' ),
								],
							],
							'stretched_section_container' => [
								'label' => __( 'Stretched Section Fit To', 'elementor' ),
								'field_args' => [
									'type' => 'text',
									'attributes' => [
										'placeholder' => 'body',
										'class' => 'medium-text',
									],
									'desc' => __( 'Enter parent element selector to which stretched sections will fit to (e.g. #primary / .wrapper / main etc). Leave blank to fit to page width.', 'elementor' ),
								],
							],
							'page_title_selector' => [
								'label' => __( 'Page Title Selector', 'elementor' ),
								'field_args' => [
									'type' => 'text',
									'attributes' => [
										'placeholder' => 'h1.entry-title',
										'class' => 'medium-text',
									],
									'desc' => __( 'Elementor lets you hide the page title. This works for themes that have "h1.entry-title" selector. If your theme\'s selector is different, please enter it above.', 'elementor' ),
								],
							],
							'viewport_lg' => [
								'label' => __( 'Tablet Breakpoint', 'elementor' ),
								'field_args' => [
									'type' => 'number',
									'attributes' => [
										'placeholder' => $default_breakpoints['lg'],
										'min' => $default_breakpoints['md'] + 1,
										'max' => $default_breakpoints['xl'] - 1,
										'class' => 'medium-text',
									],
									'sub_desc' => 'px',
									/* translators: %d: Breakpoint value */
									'desc' => sprintf( __( 'Sets the breakpoint between desktop and tablet devices. Below this breakpoint tablet layout will appear (Default: %dpx).', 'elementor' ), $default_breakpoints['lg'] ),
								],
							],
							'viewport_md' => [
								'label' => __( 'Mobile Breakpoint', 'elementor' ),
								'field_args' => [
									'type' => 'number',
									'attributes' => [
										'placeholder' => $default_breakpoints['md'],
										'min' => $default_breakpoints['sm'] + 1,
										'max' => $default_breakpoints['lg'] - 1,
										'class' => 'medium-text',
									],
									'sub_desc' => 'px',
									/* translators: %d: Breakpoint value */
									'desc' => sprintf( __( 'Sets the breakpoint between tablet and mobile devices. Below this breakpoint mobile layout will appear (Default: %dpx).', 'elementor' ), $default_breakpoints['md'] ),
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
							'edit_buttons' => [
								'label' => __( 'Editing Handles', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => '',
									'options' => [
										'' => __( 'Hide', 'elementor' ),
										'on' => __( 'Show', 'elementor' ),
									],
									'desc' => __( 'Show editing handles when hovering over the element edit button', 'elementor' ),
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
		return __( 'Elementor', 'elementor' );
	}

	/**
	 * Handle general settings update.
	 *
	 * Save general settings in one list for a future usage.
	 *
	 * @since 2.0.0
	 * @access private
	 */
	private function handle_general_settings_update() {
		if ( ! empty( $_POST['option_page'] ) && self::PAGE_ID === $_POST['option_page'] && ! empty( $_POST['action'] ) && 'update' === $_POST['action'] ) {
			check_admin_referer( 'elementor-options' );

			$saved_general_settings = get_option( General_Settings_Manager::META_KEY );

			if ( ! $saved_general_settings ) {
				$saved_general_settings = [];
			}

			$general_settings = Manager::get_settings_managers( 'general' )->get_model()->get_settings();

			foreach ( $general_settings as $setting_key => $setting ) {
				if ( ! empty( $_POST[ $setting_key ] ) ) {
					$pure_setting_key = str_replace( 'elementor_', '', $setting_key );

					$saved_general_settings[ $pure_setting_key ] = $_POST[ $setting_key ];
				}
			}

			update_option( General_Settings_Manager::META_KEY, $saved_general_settings );
		}
	}

	private function maybe_remove_all_admin_notices() {
		$elementor_pages = [
			'elementor-getting-started',
			'elementor-role-manager',
			'elementor_custom_fonts',
			'elementor-license',
		];

		if ( empty( $_GET['page'] ) || ! in_array( $_GET['page'], $elementor_pages, true ) ) {
			return;
		}

		remove_all_actions( 'admin_notices' );
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
		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 20 );
		add_action( 'admin_menu', [ $this, 'admin_menu_change_name' ], 200 );
		add_action( 'admin_menu', [ $this, 'register_pro_menu' ], self::MENU_PRIORITY_GO_PRO );
		add_action( 'admin_menu', [ $this, 'register_knowledge_base_menu' ], 501 );

		// Clear CSS Meta after change print method.
		add_action( 'add_option_elementor_css_print_method', [ $this, 'update_css_print_method' ] );
		add_action( 'update_option_elementor_css_print_method', [ $this, 'update_css_print_method' ] );

		foreach ( Responsive::get_editable_breakpoints() as $breakpoint_key => $breakpoint ) {
			foreach ( [ 'add', 'update' ] as $action ) {
				add_action( "{$action}_option_elementor_viewport_{$breakpoint_key}", [ 'Elementor\Responsive', 'compile_stylesheet_templates' ] );
			}
		}
	}
}
