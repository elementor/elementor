<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Divider;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
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
		return [ 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-e-divider';
	}

	protected static function define_props_schema(): array {
		$props = [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
		];

		return array_merge( $props, self::add_common_props() );
	}

	protected function define_atomic_controls(): array {
		$atomic_controls = [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) ),
		];

		return array_merge( $atomic_controls, self::add_common_controls() );
	}

	protected function define_base_styles(): array {
		$color_value = Color_Prop_Type::generate( 'black' );

		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'color', $color_value )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-divider' => __DIR__ . '/atomic-divider.html.twig',
		];
	}
}
