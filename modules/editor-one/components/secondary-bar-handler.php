<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Secondary_Bar;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Secondary_Bar_Handler {

	private Admin_Flow_Handler $admin_flow_handler;

	private Secondary_Bar $secondary_bar;

	private ?array $bar = null;

	public function __construct( Admin_Flow_Handler $admin_flow_handler, ?Secondary_Bar $secondary_bar = null ) {
		$this->admin_flow_handler = $admin_flow_handler;
		$this->secondary_bar = $secondary_bar ?? new Secondary_Bar();

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ], 20 );
		add_action( 'in_admin_header', [ $this, 'render' ], 20 );
		add_filter( 'admin_body_class', [ $this, 'add_body_class' ] );
	}

	public function enqueue_assets(): void {
		if ( empty( $this->get_bar() ) ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			'elementor-editor-one-secondary-bar',
			ELEMENTOR_ASSETS_URL . 'css/modules/editor-one/secondary-bar' . $min_suffix . '.css',
			[ 'elementor-common' ],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'editor-one-secondary-bar',
			ELEMENTOR_ASSETS_URL . 'js/editor-one-secondary-bar' . $min_suffix . '.js',
			[ 'elementor-common' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function render(): void {
		$this->secondary_bar->render( $this->get_bar() );
	}

	public function add_body_class( $classes ): string {
		$classes = is_string( $classes ) ? $classes : '';

		if ( empty( $this->get_bar() ) ) {
			return $classes;
		}

		return $classes . ' e-has-secondary-bar';
	}

	private function get_bar(): array {
		if ( null !== $this->bar ) {
			return $this->bar;
		}

		$this->bar = $this->secondary_bar->get_bar(
			$this->admin_flow_handler->get_map(),
			Menu_Data_Provider::instance(),
			$this->admin_flow_handler->get_active_state()
		);

		return $this->bar;
	}
}
