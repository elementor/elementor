<?php

namespace Elementor\Core\Admin\Menu;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Main extends Base {

	protected function get_init_args() {
		return [
			'page_title' => esc_html__( 'Elementor', 'elementor' ),
			'menu_title' => esc_html__( 'Elementor', 'elementor' ),
			'capability' => 'manage_options',
			'menu_slug' => 'elementor',
			'function' => null,
			'position' => 58.5,
		];
	}
}
