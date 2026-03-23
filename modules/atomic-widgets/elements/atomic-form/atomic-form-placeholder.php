<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Form_Placeholder extends Atomic_Element_Base {

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
		$this->meta( 'is_pro_placeholder', true );
	}

	public static function get_type() {
		return 'e-form';
	}

	public static function get_element_type(): string {
		return self::get_type();
	}

	public function get_title() {
		return esc_html__( 'Atomic Form', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-atomic-form';
	}

	protected static function define_props_schema(): array {
		return [];
	}

	protected function define_atomic_controls(): array {
		return [];
	}

	protected function should_show_in_panel() {
		return false;
	}

	public function before_render() {
	}

	public function after_render() {
	}

	protected function render() {
	}

	protected function content_template() {
	}
}
