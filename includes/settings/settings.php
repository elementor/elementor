<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Settings {

	const PAGE_ID = 'elementor';

	const MENU_PRIORITY_GO_PRO = 502;

	const UPDATE_TIME_FIELD = '_elementor_settings_update_time';

	public static function get_url() {
		return admin_url( 'admin.php?page=' . self::PAGE_ID );
	}

	public function register_settings_fields() {
		$controls_class_name = __NAMESPACE__ . '\Settings_Controls';
		$validations_class_name = __NAMESPACE__ . '\Settings_Validations';

		// Register the main section
		$main_section = 'elementor_general_section';

		add_settings_section(
			$main_section,
			__( 'General Settings', 'elementor' ),
			'__return_empty_string', // No need intro text for this section right now
			self::PAGE_ID
		);

		$field_id = 'elementor_cpt_support';
		add_settings_field(
			$field_id,
			__( 'Post Types', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$main_section,
			[
				'id' => $field_id,
				'type' => 'checkbox_list_cpt',
				'std' => [ 'page', 'post' ],
				'exclude' => [ 'attachment', 'elementor_library' ],
			]
		);

		register_setting( self::PAGE_ID, $field_id, [ $validations_class_name, 'checkbox_list' ] );

		$field_id = 'elementor_exclude_user_roles';
		add_settings_field(
			$field_id,
			__( 'Exclude Roles', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$main_section,
			[
				'id' => $field_id,
				'type' => 'checkbox_list_roles',
				'exclude' => [ 'administrator' ],
			]
		);

		register_setting( self::PAGE_ID, $field_id, [ $validations_class_name, 'checkbox_list' ] );

		// Style section
		$style_section = 'elementor_style_section';

		add_settings_section(
			$style_section,
			__( 'Style Settings', 'elementor' ),
			'__return_empty_string', // No need intro text for this section right now
			self::PAGE_ID
		);

		$field_id = 'elementor_disable_color_schemes';
		add_settings_field(
			$field_id,
			__( 'Disable Global Colors', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$style_section,
			[
				'id' => $field_id,
				'type' => 'checkbox',
				'value' => 'yes',
				'sub_desc' => __( 'Checking this box will disable Elementor\'s Global Colors, and make Elementor inherit the colors from your theme.', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id );

		$field_id = 'elementor_disable_typography_schemes';
		add_settings_field(
			$field_id,
			__( 'Disable Global Fonts', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$style_section,
			[
				'id' => $field_id,
				'type' => 'checkbox',
				'value' => 'yes',
				'sub_desc' => __( 'Checking this box will disable Elementor\'s Global Fonts, and make Elementor inherit the fonts from your theme.', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id );

		$field_id = 'elementor_default_generic_fonts';
		add_settings_field(
			$field_id,
			__( 'Default Generic Fonts', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$style_section,
			[
				'id' => $field_id,
				'type' => 'text',
				'std' => 'Sans-serif',
				'classes' => [ 'medium-text' ],
				'desc' => __( 'The list of fonts used if the chosen font is not available.', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id );

		$field_id = 'elementor_container_width';
		add_settings_field(
			$field_id,
			__( 'Content Width', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$style_section,
			[
				'id' => $field_id,
				'type' => 'text',
				'placeholder' => '1140',
				'sub_desc' => 'px',
				'classes' => [ 'medium-text' ],
				'desc' => __( 'Sets the default width of the content area (Default: 1140)', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id );

		$field_id = 'elementor_stretched_section_container';
		add_settings_field(
			$field_id,
			__( 'Stretched Section Fit To', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$style_section,
			[
				'id' => $field_id,
				'type' => 'text',
				'placeholder' => 'body',
				'classes' => [ 'medium-text' ],
				'desc' => __( 'Enter parent element selector to which stretched sections will fit to (e.g. #primary / .wrapper / main etc). Leave blank to fit to page width.', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id );

		$field_id = 'elementor_page_title_selector';
		add_settings_field(
			$field_id,
			__( 'Page Title Selector', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$style_section,
			[
				'id' => $field_id,
				'type' => 'text',
				'placeholder' => 'h1.entry-title',
				'classes' => [ 'medium-text' ],
				'desc' => __( 'Elementor lets you hide the page title. This works for themes that have "h1.entry-title" selector. If your theme\'s selector is different, please enter it above.', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id );

		add_settings_field(
			self::UPDATE_TIME_FIELD,
			'',
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$style_section,
			[
				'id' => self::UPDATE_TIME_FIELD,
				'type' => 'hidden',
			]
		);

		register_setting( self::PAGE_ID, self::UPDATE_TIME_FIELD, [ 'sanitize_callback' => 'time' ] );
	}

	public function register_improve_elementor_settings() {
		$controls_class_name = __NAMESPACE__ . '\Settings_Controls';
		$usage_section = 'elementor_usage_section';

		add_settings_section(
			$usage_section,
			__( 'Improve Elementor', 'elementor' ),
			'__return_empty_string', // No need intro text for this section right now
			self::PAGE_ID
		);

		$field_id = 'elementor_allow_tracking';
		add_settings_field(
			$field_id,
			__( 'Usage Data Tracking', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$usage_section,
			[
				'id' => $field_id,
				'type' => 'checkbox',
				'value' => 'yes',
				'default' => '',
				'sub_desc' => __( 'Opt-in to our anonymous plugin data collection and to updates. We guarantee no sensitive data is collected.', 'elementor' ) . sprintf( ' <a href="%s" target="_blank">%s</a>', 'https://go.elementor.com/usage-data-tracking/', __( 'Learn more.', 'elementor' ) ),
			]
		);

		register_setting( self::PAGE_ID, $field_id, [ __NAMESPACE__ . '\Tracker', 'check_for_settings_optin' ] );
	}

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

	public function go_elementor_pro() {
		if ( isset( $_GET['page'] ) && 'go_elementor_pro' === $_GET['page'] ) {
			wp_redirect( 'https://go.elementor.com/pro-admin-menu/' );
		}
	}

	public function admin_menu_change_name() {
		global $submenu;

		if ( isset( $submenu['elementor'] ) )
			$submenu['elementor'][0][0] = __( 'Settings', 'elementor' );
	}

	public function display_settings_page() {
		?>
		<div class="wrap">
			<h2><?php _e( 'Elementor', 'elementor' ); ?></h2>
			<form method="post" action="options.php">
				<?php
				settings_fields( self::PAGE_ID );
				do_settings_sections( self::PAGE_ID );

				submit_button();
				?>
			</form>
		</div><!-- /.wrap -->
		<?php
	}

	public function __construct() {
		include( ELEMENTOR_PATH . 'includes/settings/controls.php' );
		include( ELEMENTOR_PATH . 'includes/settings/validations.php' );

		add_action( 'admin_init', [ $this, 'register_settings_fields' ], 20 );
		add_action( 'admin_init', [ $this, 'register_improve_elementor_settings' ], 999 ); // Keep it the last settings in page
		add_action( 'admin_init', [ $this, 'go_elementor_pro' ] );
		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 20 );
		add_action( 'admin_menu', [ $this, 'admin_menu_change_name' ], 200 );
		add_action( 'admin_menu', [ $this, 'register_pro_menu' ], self::MENU_PRIORITY_GO_PRO );
	}
}
