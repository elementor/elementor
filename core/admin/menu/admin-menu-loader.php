<?php

namespace Elementor\Core\Admin\Menu;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Menu_Loader {

	private static $instance = null;

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		$this->init();
	}

	private function init() {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_menu_assets' ] );
		add_action( 'admin_head', [ $this, 'hide_legacy_templates_menu' ], 999 );
	}

	public function enqueue_admin_menu_assets() {
		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

		wp_enqueue_script(
			'elementor-admin-menu',
			ELEMENTOR_ASSETS_URL . 'js/admin-menu' . $suffix . '.js',
			[],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function hide_legacy_templates_menu() {
		?>
		<style type="text/css">
			/* Hide the legacy Templates top-level menu for backward compatibility */
			#menu-posts-elementor_library {
				display: none !important;
			}
		</style>
		<?php
	}
}

