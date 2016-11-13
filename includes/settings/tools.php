<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Tools {

	const PAGE_ID = 'elementor-tools';

	public static function get_url() {
		return admin_url( 'admin.php?page=' . self::PAGE_ID );
	}

	public function register_admin_menu() {
		add_submenu_page(
			Settings::PAGE_ID,
			__( 'Elementor Tools', 'elementor' ),
			__( 'Tools', 'elementor' ),
			'manage_options',
			self::PAGE_ID,
			[ $this, 'display_settings_page' ]
		);
	}

	public function register_settings_fields() {
		$controls_class_name = __NAMESPACE__ . '\Settings_Controls';
		$tools_section = 'elementor_tools_section';
		add_settings_section(
			$tools_section,
			'',
			'__return_empty_string', // No need intro text for this section right now
			self::PAGE_ID
		);

		$field_id = 'elementor_clear_cache';
		add_settings_field(
			$field_id,
			__( 'Clear Cache', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$tools_section,
			[
				'id' => $field_id,
				'type' => 'raw_html',
				'html' => sprintf( '<button data-nonce="%s" class="button" name="tool_name" value="clear_cache" id="elementor-clear-cache">%s</button>', wp_create_nonce( 'elementor_clear_cache' ), __( 'Clear Cache', 'elementor' ) ),
				'desc' => __( 'Delete generated css files', 'elementor' ),
			]
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

	public function display_settings_page() {
		?>
		<div class="wrap">
			<h2><?php _e( 'Elementor Tools', 'elementor' ); ?></h2>
			<form method="post" action="">
				<?php
				settings_fields( self::PAGE_ID );
				do_settings_sections( self::PAGE_ID );
				?>
			</form>
		</div><!-- /.wrap -->

		<?php

	}

	public function process_form() {
		if ( empty( $_POST['option_page'] ) || self::PAGE_ID !== $_POST['option_page'] ) {
			return;
		}

		switch ( $_POST['tool_name'] ) {
			case 'clear_cache':
				$errors = Plugin::instance()->posts_css_manager->clear_cache();

				add_action( 'admin_notices', function() use ( $errors ) {
					if ( empty( $errors ) ) {
						echo '<div class="notice notice-success"><p>' . __( 'Cache has been cleared', 'elementor' ) . '</p></div>';
					} else {
						echo '<div class="notice notice-error"><p>' . implode( '<br>', $errors ) . '</p></div>';
					}
				} );
				break;
		}
	}

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 205 );
		add_action( 'admin_init', [ $this, 'register_settings_fields' ], 20 );

		if ( ! empty( $_POST ) ) {
			add_action( 'admin_init', [ $this, 'process_form' ], 10 );
		}
	}
}
