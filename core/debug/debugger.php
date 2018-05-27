<?php
namespace Elementor\Core\Debug;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Debugger {

	protected $log = [];

	public function __construct() {
		if ( WP_DEBUG ) {
			add_action( 'admin_bar_menu', [ $this, 'add_menu_in_admin_bar' ], 201 );
		}
	}

	public function parse_template_path( $template ) {
		// `untrailingslashit` for windows path style.
		if ( 0 === strpos( $template, untrailingslashit( ELEMENTOR_PATH ) ) ) {
			return 'Elementor - ' . basename( $template );
		}

		if ( 0 === strpos( $template, get_stylesheet_directory() ) ) {
			return wp_get_theme()->get( 'Name' ) . ' - ' . basename( $template );
		}

		return str_replace( WP_CONTENT_DIR, '', $template );
	}

	public function add_log( $module, $title, $url = '' ) {
		if ( ! WP_DEBUG ) {
			return;
		}

		$this->log[] = [
			'module' => $module,
			'title' => $title,
			'url' => $url,
		];
	}

	public function add_menu_in_admin_bar( \WP_Admin_Bar $wp_admin_bar ) {
		if ( empty( $this->log ) ) {
			return;
		}

		$wp_admin_bar->add_node( [
			'id' => 'elementor_debugger',
			'title' => __( 'Elementor Debugger', 'elementor' ),
		] );

		foreach ( $this->log as $index => $log ) {
			$url = $log['url'];

			unset( $log['url'] );

			$wp_admin_bar->add_menu( [
				'id' => 'elementor_debugger_log_' . $index,
				'parent' => 'elementor_debugger',
				'href' => $url,
				'title' => implode( ' > ', $log ),
				'meta' => [
					'target' => '_blank',
				],
			] );
		}
	}
}
