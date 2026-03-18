<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Form_Success_Message;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Form_Message\Form_Message;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Form_Success_Message extends Form_Message {

	public static function get_type() {
		return 'e-form-success-message';
	}

	public static function get_element_type(): string {
		return 'e-form-success-message';
	}

	public function get_title() {
		return esc_html__( 'Success message', 'elementor' );
	}

	protected static function get_background_color(): string {
		return '#D4E9D6';
	}

	protected static function get_text_color(): string {
		return '#2F532E';
	}

	protected function get_css_id_control_meta(): array {
		return [
			'layout' => 'two-columns',
			'topDivider' => false,
		];
	}
}
