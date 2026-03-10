<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Form_Message;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
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

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Form_Message extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	abstract protected static function get_background_color(): string;

	abstract protected static function get_text_color(): string;

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
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
			'attributes' => Attributes_Prop_Type::make(),
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
								'color' => Color_Prop_Type::generate( static::get_background_color() ),
							] ),
							'color' => Color_Prop_Type::generate( static::get_text_color() ),
							'padding' => Size_Prop_Type::generate( [
								'size' => 12,
								'unit' => 'px',
							] ),
							'text-align' => String_Prop_Type::generate( 'center' ),
							'font-size' => Size_Prop_Type::generate( [
								'size' => 12,
								'unit' => 'px',
							] ),
							'font-family' => String_Prop_Type::generate( 'Poppins' ),
						] )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/form-message' => __DIR__ . '/form-message.html.twig',
		];
	}

	protected function build_template_context(): array {
		return $this->build_base_template_context();
	}
}
