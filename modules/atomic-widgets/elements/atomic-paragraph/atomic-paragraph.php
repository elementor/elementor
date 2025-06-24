<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Paragraph extends Atomic_Widget_Base {
	use Has_Template;

	const LINK_BASE_STYLE_KEY = 'link-base';

	public static function get_element_type(): string {
		return 'e-paragraph';
	}

	public function get_title() {
		return esc_html__( 'Paragraph', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-paragraph';
	}

	protected static function define_props_schema(): array {
		$props = [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'paragraph' => String_Prop_Type::make()
				->default( __( 'Type your paragraph here', 'elementor' ) ),

			'link' => Link_Prop_Type::make(),

			'attributes' => Key_Value_Array_Prop_Type::make(),
		];

		return $props;
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Textarea_Control::bind_to( 'paragraph' )
						->set_label( __( 'Paragraph', 'elementor' ) )
						->set_placeholder( __( 'Type your paragraph here', 'elementor' ) ),
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
		$margin_value = Size_Prop_Type::generate( [
			'unit' => 'px',
			'size' => 0 ,
		] );

		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'margin', $margin_value )
				),
			self::LINK_BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'all', 'unset' )
						->add_prop( 'cursor', 'pointer' )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-paragraph' => __DIR__ . '/atomic-paragraph.html.twig',
		];
	}
}
