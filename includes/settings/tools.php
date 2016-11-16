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
			__( 'Regenerate CSS', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$tools_section,
			[
				'id' => $field_id,
				'type' => 'raw_html',
				'html' => sprintf( '<button data-nonce="%s" class="button elementor-button-spinner" id="elementor-clear-cache-button">%s</button>', wp_create_nonce( 'elementor_clear_cache' ), __( 'Regenerate Files', 'elementor' ) ),
				'desc' => __( 'Styles set in Elementor are saved in CSS files in the uploads folder. Recreate those files, according to the most recent settings.', 'elementor' ),
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
				'html' => sprintf( '<button data-nonce="%s" class="button elementor-button-spinner" id="elementor-library-sync-button">%s</button>', wp_create_nonce( 'elementor_reset_library' ), __( 'Sync Library', 'elementor' ) ),
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

	public function ajax_elementor_clear_cache() {
		check_ajax_referer( 'elementor_clear_cache', '_nonce' );

		Plugin::instance()->posts_css_manager->clear_cache();

		wp_send_json_success();
	}

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 205 );
		add_action( 'admin_init', [ $this, 'register_settings_fields' ], 20 );

		if ( ! empty( $_POST ) ) {
			add_action( 'wp_ajax_elementor_clear_cache', [ $this, 'ajax_elementor_clear_cache' ], 10 );
		}
	}
}
