<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Svg extends Atomic_Widget_Base {
	use Has_Template;

	const BASE_STYLE_KEY = 'base';
	const DEFAULT_SVG = 'images/default-svg.svg';
	const DEFAULT_SVG_URL = ELEMENTOR_ASSETS_URL . self::DEFAULT_SVG;

	public static function get_element_type(): string {
		return 'e-svg';
	}

	public function get_title() {
		return esc_html__( 'SVG', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-svg';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'svg' => Svg_Prop_Type::make()->default_url( static::DEFAULT_SVG_URL ),
			'link' => Link_Prop_Type::make(),
			'attributes' => Key_Value_Array_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( esc_html__( 'Content', 'elementor' ) )
				->set_items( [
					Svg_Control::bind_to( 'svg' )
						->set_label( __( 'SVG', 'elementor' ) ),
				] ),
		];
	}

	protected function get_settings_controls(): array {
		return [
			Link_Control::bind_to( 'link' )
				->set_label( __( 'Link', 'elementor' ) ),
		];
	}

	protected function define_base_styles(): array {
		$display_value = String_Prop_Type::generate( 'inline-block' );

		$size = Size_Prop_Type::generate( [
			'size' => 65,
			'unit' => 'px',
		] );

		return [
			self::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', $display_value )
						->add_prop( 'width', $size )
						->add_prop( 'height', $size )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-svg' => __DIR__ . '/atomic-svg.html.twig',
		];
	}
}
