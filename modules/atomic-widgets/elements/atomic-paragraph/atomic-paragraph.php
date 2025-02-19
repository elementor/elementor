<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\WpRest\Classes\WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Paragraph extends Atomic_Widget_Base {
	use Has_Template;

	public static function get_element_type(): string {
		return 'a-paragraph';
	}

	public function get_title() {
		return esc_html__( 'Atomic Paragraph', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-paragraph';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'paragraph' => String_Prop_Type::make()
				->default( __( 'Type your paragraph here', 'elementor' ) ),

			'link' => Link_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Textarea_Control::bind_to( 'paragraph' )
						->set_label( __( 'Paragraph', 'elementor' ) )
						->set_placeholder( __( 'Type your paragraph here', 'elementor' ) ),

					Link_Control::bind_to( 'link' ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		$color_value = Color_Prop_Type::generate( 'black' );
		$font_family_value = String_Prop_Type::generate( 'Poppins' );
		$font_size_value = Size_Prop_Type::generate( [
			'size' => 1.2,
			'unit' => 'rem',
		] );
		$line_height_value = String_Prop_Type::generate( '1.5' );

		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'color', $color_value )
						->add_prop( 'font-family', $font_family_value )
						->add_prop( 'font-size', $font_size_value )
						->add_prop( 'line-height', $line_height_value )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-paragraph' => __DIR__ . '/atomic-paragraph.html.twig',
		];
	}
}
