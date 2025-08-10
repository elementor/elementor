<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Flexbox;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Controls\Section;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Flexbox extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	public static function get_type() {
		return 'e-flexbox';
	}

	public static function get_element_type(): string {
		return 'e-flexbox';
	}

	public function get_title() {
		return esc_html__( 'Flexbox', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-flexbox';
	}

	protected static function define_props_schema(): array {
		return static::get_common_element_props_schema();
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( $this->get_common_element_settings_controls() ),
		];
	}

	protected function define_base_styles(): array {
		$display = String_Prop_Type::generate( 'flex' );
		$flex_direction = String_Prop_Type::generate( 'row' );

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', $display )
						->add_prop( 'flex-direction', $flex_direction )
						->add_prop( 'padding', $this->get_base_padding() )
				),
		];
	}

	protected function get_base_padding(): array {
		return Size_Prop_Type::generate( [
			'size' => 10,
			'unit' => 'px',
		] );
	}
}
