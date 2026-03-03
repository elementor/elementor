<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu_Toggle;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Mega_Menu_Toggle extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'llm_support', false );
	}

	public static function get_type() {
		return 'e-mega-menu-toggle';
	}

	public static function get_element_type(): string {
		return 'e-mega-menu-toggle';
	}

	public function get_title() {
		return esc_html__( 'Menu Toggle', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'menu', 'toggle', 'hamburger' ];
	}

	public function get_icon() {
		return 'eicon-menu-bar';
	}

	public function should_show_in_panel() {
		return false;
	}

	protected function define_default_html_tag() {
		return 'button';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'attributes' => Attributes_Prop_Type::make()
				->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [] ),
		];
	}

	protected function define_base_styles(): array {
		$styles = [
			'display' => String_Prop_Type::generate( 'flex' ),
			'align-items' => String_Prop_Type::generate( 'center' ),
			'justify-content' => String_Prop_Type::generate( 'center' ),
			'cursor' => String_Prop_Type::generate( 'pointer' ),
			'background' => Background_Prop_Type::generate( [
				'color' => Color_Prop_Type::generate( '#FFFFFF' ),
			] ),
			'color' => Color_Prop_Type::generate( '#0C0D0E' ),
			'padding' => Size_Prop_Type::generate( [
				'size' => 12,
				'unit' => 'px',
			] ),
			'font-size' => Size_Prop_Type::generate( [
				'size' => 24,
				'unit' => 'px',
			] ),
			'border-radius' => Size_Prop_Type::generate( [
				'size' => 4,
				'unit' => 'px',
			] ),
		];

		$hover_styles = [
			'background' => Background_Prop_Type::generate( [
				'color' => Color_Prop_Type::generate( '#F5F5F5' ),
			] ),
		];

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( $styles )
				)
				->add_variant(
					Style_Variant::make()
						->set_state( Style_States::HOVER )
						->add_props( $hover_styles )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-mega-menu-toggle' => __DIR__ . '/atomic-mega-menu-toggle.html.twig',
		];
	}
}
