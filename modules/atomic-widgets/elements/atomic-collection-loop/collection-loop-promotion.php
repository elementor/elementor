<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Collection_Loop;

use Elementor\Modules\AtomicWidgets\Elements\Base\Html_Tag_Computer;
use Elementor\Modules\AtomicWidgets\Elements\Promotions\Atomic_Pro_Promotion_Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Collection_Loop_Promotion extends Atomic_Pro_Promotion_Element_Base {

	protected function uses_compound_container_meta(): bool {
		return true;
	}

	public static function get_type() {
		return 'e-collection-loop';
	}

	public static function get_element_type(): string {
		return self::get_type();
	}

	public function get_title() {
		return esc_html__( 'Loop', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-loop-widget';
	}

	public static function get_computed_html_tag( array $settings ): string {
		return Html_Tag_Computer::compute( $settings, 'div' );
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/collection-loop-promotion' => __DIR__ . '/collection-loop-promotion.html.twig',
		];
	}
}
