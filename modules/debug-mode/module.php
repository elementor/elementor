<?php
namespace Elementor\Modules\DebugMode;

use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public function get_name() {
		return 'debug-mode';
	}

	public function __construct() {
		add_action( 'elementor/admin/after_create_settings/elementor-tools', [ $this, 'add_admin_button' ] );

		add_action( 'add_option_elementor_debug_mode', [ $this, 'update_debug_mode' ], 10, 2 );
		add_action( 'update_option_elementor_debug_mode', [ $this, 'update_debug_mode' ], 10, 2 );
	}

	/**
	 * @param Tools $tools_page
	 *
	 */
	public function add_admin_button( $tools_page ) {
		$tools_page->add_tab( 'debug_mode', [
			'label' => __( 'Debug mode', 'elementor' ),
			'sections' => [
				'debug_mode' => [
					'fields' => [
						'debug_mode' => [
							'label' => __( 'Enable Debug Mode', 'elementor' ),
							'field_args' => [
								'type' => 'checkbox',
								'value' => 'yes',
								'sub_desc' => __( 'Enable Debug mode. <a href="#">Learn More</a>.', 'elementor' ),
							],
						],
					],
				],
			],
		] );
	}

	public function update_debug_mode( $option, $value ) {
		if ( 'yes' === $value ) {
			$this->enable_debug_mode();
		} else {
			$this->disable_debug_mode();
		}
	}

	public function enable_debug_mode() {
		WP_Filesystem();

		$allowed_plugins = [
			'elementor' => ELEMENTOR_PLUGIN_BASE,
		];

		if ( defined( 'ELEMENTOR_PRO_PLUGIN_BASE' ) ) {
			$allowed_plugins['elementor_pro'] = ELEMENTOR_PRO_PLUGIN_BASE;
		}

		add_option( 'elementor_debug_mode_allowed_plugins', $allowed_plugins );

		if ( ! is_dir( WPMU_PLUGIN_DIR ) ) {
			wp_mkdir_p( WPMU_PLUGIN_DIR );
			add_option( 'elementor_debug_mode_created_mu_dir', true );
		}

		copy_dir( __DIR__ . '/mu-plugin/', WPMU_PLUGIN_DIR );
	}

	public function disable_debug_mode() {
		$file_path = WP_CONTENT_DIR . '/mu-plugins/elementor-debug-mode.php';
		if ( file_exists( $file_path ) ) {
			unlink( $file_path );
		}

		if ( get_option( 'elementor_debug_mode_created_mu_dir' ) ) {
			// It will be removed only if it's empty.
			@rmdir( WPMU_PLUGIN_DIR );
		}

		delete_option( 'elementor_debug_mode' );
		delete_option( 'elementor_debug_mode_allowed_plugins' );
		delete_option( 'theme_mods_elementor-debug' );
		delete_option( 'elementor_debug_mode_created_mu_dir' );
	}
}
