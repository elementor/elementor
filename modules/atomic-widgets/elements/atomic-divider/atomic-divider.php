<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Divider;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Divider extends Atomic_Widget_Base {
	use Has_Template;

	public static function get_element_type(): string {
		return 'e-divider';
	}

	public function get_title() {
		return esc_html__( 'Divider', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'divider', 'hr', 'line', 'border', 'separator' ];
	}

	public function get_icon() {
		return 'eicon-e-divider';
	}

	protected static function define_props_schema(): array {
		$props = [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
		];

		return $props;
	}

	protected function define_atomic_controls(): array {
		return [];
	}

	protected function get_settings_controls(): array {
		return [];
	}

	protected function define_base_styles(): array {
		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-divider' => __DIR__ . '/atomic-divider.html.twig',
		];
	}
}
