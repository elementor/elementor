<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Youtube;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Youtube extends Atomic_Widget_Base {
	use Has_Template;

	public static function get_element_type(): string {
		return 'e-youtube';
	}

	public function get_title() {
		return esc_html__( 'YouTube', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-video';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'link' => String_Prop_Type::make(),

			'mute' => Boolean_Prop_Type::make()->default( false ),

			'loop' => Boolean_Prop_Type::make()->default( false ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Text_Control::bind_to( 'link' ),

				] ),
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
		];
	}

	public function get_script_depends() {
		return [ 'elementor-youtube-handler' ];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-youtube' => __DIR__ . '/atomic-youtube.html.twig',
		];
	}
}
