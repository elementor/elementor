<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Settings {

	const PAGE_ID = 'elementor';

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

		$field_id = 'elementor_allow_tracking';
		add_settings_field(
			$field_id,
			__( 'Usage Data Tracking', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$main_section,
			[
				'id' => $field_id,
				'type' => 'checkbox',
				'value' => 'yes',
				'default' => '',
				'sub_desc' => __( 'Opt-in to our anonymous plugin data collection and to updates. We guarantee no sensitive data is collected.', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id, [ __NAMESPACE__ . '\Tracker', 'check_for_settings_optin' ] );

		// Style section
		$style_section = 'elementor_style_section';

		add_settings_section(
			$style_section,
			__( 'Style Settings', 'elementor' ),
			'__return_empty_string', // No need intro text for this section right now
			self::PAGE_ID
		);

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
				'sub_desc' => __( 'The list of fonts used if the chosen font is not available.', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id );

		$field_id = 'elementor_disable_color_schemes';
		add_settings_field(
			$field_id,
			__( 'Disable Color Palettes', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$style_section,
			[
				'id' => $field_id,
				'type' => 'checkbox',
				'value' => 'yes',
				'sub_desc' => __( 'Color Palettes let you change the default colors that appear under the various widgets. If you prefer to inherit the colors from your theme, you can disable this feature.', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id );

		$field_id = 'elementor_disable_typography_schemes';
		add_settings_field(
			$field_id,
			__( 'Disable Default Fonts', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$style_section,
			[
				'id' => $field_id,
				'type' => 'checkbox',
				'value' => 'yes',
				'sub_desc' => __( 'Default Fonts let you change the fonts that appear on Elementor from one place. If you prefer to inherit the fonts from your theme, you can disable this feature here.', 'elementor' ),
			]
		);

		register_setting( self::PAGE_ID, $field_id );

		$tools_section = 'elementor_tools_section';
		add_settings_section(
			$tools_section,
			__( 'Tools', 'elementor' ),
			'__return_empty_string', // No need intro text for this section right now
			self::PAGE_ID
		);

		$field_id = 'elementor_raw_reset_api_data';
		add_settings_field(
			$field_id,
			__( 'Sync Library', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$tools_section,
			[
				'id' => $field_id,
				'type' => 'raw_html',
				'html' => sprintf( '<button data-nonce="%s" class="button" id="elementor-library-sync-button">%s</button>', wp_create_nonce( 'elementor_reset_library' ), __( 'Sync Library', 'elementor' ) ),
				'desc' => __( 'Elementor Library automatically updates on a daily basis. You can also manually update it by clicking on the sync button.', 'elementor' ),
			]
		);
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
		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 20 );
	}
}
