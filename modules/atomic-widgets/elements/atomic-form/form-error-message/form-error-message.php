<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Form_Error_Message;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Form_Message\Form_Message;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Form_Error_Message extends Form_Message {

	public static function get_type() {
		return 'e-form-error-message';
	}

	public static function get_element_type(): string {
		return 'e-form-error-message';
	}

	public function get_title() {
		return esc_html__( 'Error message', 'elementor' );
	}

	protected static function get_background_color(): string {
		return '#ffdede';
	}

	protected static function get_text_color(): string {
		return '#870000';
	}

	protected function get_css_id_control_meta(): array {
		return [
			'layout' => 'two-columns',
			'topDivider' => false,
		];
	}
}
