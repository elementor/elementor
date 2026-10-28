<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form;

use Elementor\Modules\AtomicWidgets\Elements\Base\Html_Tag_Computer;
use Elementor\Modules\AtomicWidgets\Elements\Promotions\Atomic_Pro_Promotion_Element_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Form_Promotion extends Atomic_Pro_Promotion_Element_Base {

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

	public static function get_computed_html_tag( array $settings ): string {
		return Html_Tag_Computer::compute( $settings, 'div' );
	}

	protected static function define_props_schema(): array {
		return Atomic_Form::get_base_props_schema();
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-form-promotion' => __DIR__ . '/atomic-form-promotion.html.twig',
		];
	}
}
