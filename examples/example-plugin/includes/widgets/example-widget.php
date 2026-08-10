<?php
namespace Elementor_Example_Plugin;

use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Example_Widget extends Widget_Base {

	public function get_name(): string {
		return 'elementor-example-widget';
	}

	public function get_title(): string {
		return esc_html__( 'Example Widget', 'elementor-example-plugin' );
	}

	public function get_icon(): string {
		return 'eicon-code';
	}

	public function get_categories(): array {
		return [ 'elementor-examples' ];
	}

	protected function register_controls(): void {}

	protected function render(): void {}
}
