<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Button;

use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\WpRest\Classes\WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Button extends Atomic_Widget_Base {
	use Has_Template;

	public static function get_element_type(): string {
		return 'a-button';
	}

	public function get_title() {
		return esc_html__( 'Atomic Button', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-e-button';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'text' => String_Prop_Type::make()
				->default( __( 'Click here', 'elementor' ) ),

			'link' => Link_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Text_Control::bind_to( 'text' )
						->set_label( __( 'Button text', 'elementor' ) )
						->set_placeholder( __( 'Type your button text here', 'elementor' ) ),

					Link_Control::bind_to( 'link' ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		$color_value = Color_Prop_Type::generate( 'white' );
		$font_family_value = String_Prop_Type::generate( 'Poppins' );
		$font_size_value = Size_Prop_Type::generate( [
			'size' => 16,
			'unit' => 'px',
		] );
		$background_color_value = Background_Prop_Type::generate( [
			'color' => Color_Prop_Type::generate( '#375EFB' ),
		] );
		$display_value = String_Prop_Type::generate( 'inline-block' );
		$padding_value = Dimensions_Prop_Type::generate( [
			'top' => Size_Prop_Type::generate( [
				'size' => 12,
				'unit' => 'px',
			]),
			'right' => Size_Prop_Type::generate( [
				'size' => 24,
				'unit' => 'px',
			]),
			'bottom' => Size_Prop_Type::generate( [
				'size' => 12,
				'unit' => 'px',
			]),
			'left' => Size_Prop_Type::generate( [
				'size' => 24,
				'unit' => 'px',
			]),
		]);
		$border_radius_value = Size_Prop_Type::generate( [
			'size' => 2,
			'unit' => 'px',
		] );
		$border_width_value = Size_Prop_Type::generate( [
			'size' => 0,
			'unit' => 'px',
		] );
		$text_align_value = String_Prop_Type::generate( 'center' );
		$font_weight_value = String_Prop_Type::generate( '500' );

		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'color', $color_value )
						->add_prop( 'font-family', $font_family_value )
						->add_prop( 'font-size', $font_size_value )
						->add_prop( 'background', $background_color_value )
						->add_prop( 'display', $display_value )
						->add_prop( 'font-weight', $font_weight_value )
						->add_prop( 'padding', $padding_value )
						->add_prop( 'text-align', $text_align_value )
						->add_prop( 'border-radius', $border_radius_value )
						->add_prop( 'border-width', $border_width_value )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-button' => __DIR__ . '/atomic-button.html.twig',
		];
	}
}
