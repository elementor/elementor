<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Form_Success_Message;

use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Form_Success_Message extends Div_Block {

	public static function get_type() {
		return 'e-form-success-message';
	}

	public static function get_element_type(): string {
		return 'e-form-success-message';
	}

	public function get_title() {
		return esc_html__( 'Form success message', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-div-block';
	}

	public function should_show_in_panel() {
		return false;
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'block' ),
							'background' => Background_Prop_Type::generate( [
								'color' => Color_Prop_Type::generate( '#D4E9D6' ),
							] ),
							'color' => Color_Prop_Type::generate( '#2F532E' ),
							'padding' => Size_Prop_Type::generate( [
								'size' => 12,
								'unit' => 'px',
							] ),
							'text-align' => String_Prop_Type::generate( 'center' ),
							'font-size' => Size_Prop_Type::generate( [
								'size' => 12,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}
}
