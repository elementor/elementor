<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu_Item;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu\Atomic_Mega_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Mega_Menu_Item extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'llm_support', false );
	}

	public static function get_type() {
		return 'e-mega-menu-item';
	}

	public static function get_element_type(): string {
		return 'e-mega-menu-item';
	}

	public function get_title() {
		return esc_html__( 'Menu Item', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'menu', 'item' ];
	}

	public function get_icon() {
		return 'eicon-nav-menu';
	}

	public function should_show_in_panel() {
		return false;
	}

	protected function define_default_html_tag() {
		return 'li';
	}

	protected function define_initial_attributes() {
		return [
			'role' => 'none',
		];
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

	protected function define_atomic_style_states(): array {
		$selected_state = Style_States::get_class_states_map()['selected'];

		return [ $selected_state ];
	}

	protected function define_base_styles(): array {
		$styles = [
			'display' => String_Prop_Type::generate( 'flex' ),
			'align-items' => String_Prop_Type::generate( 'center' ),
			'cursor' => String_Prop_Type::generate( 'pointer' ),
			'color' => Color_Prop_Type::generate( '#3B3B3B' ),
			'font-size' => Size_Prop_Type::generate( [
				'size' => 15,
				'unit' => 'px',
			] ),
			'font-weight' => String_Prop_Type::generate( '500' ),
			'padding' => Size_Prop_Type::generate( [
				'size' => 14,
				'unit' => 'px',
			] ),
			'background' => Background_Prop_Type::generate( [
				'color' => Color_Prop_Type::generate( 'transparent' ),
			] ),
		];

		$selected_styles = [
			'color' => Color_Prop_Type::generate( '#0C0D0E' ),
			'background' => Background_Prop_Type::generate( [
				'color' => Color_Prop_Type::generate( '#F0F0F0' ),
			] ),
		];

		$hover_styles = [
			'color' => Color_Prop_Type::generate( '#0C0D0E' ),
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
						->set_state( Style_States::SELECTED )
						->add_props( $selected_styles )
				)
				->add_variant(
					Style_Variant::make()
						->set_state( Style_States::HOVER )
						->add_props( $hover_styles )
				),
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Paragraph::generate()
				->settings( [
					'paragraph' => Html_V3_Prop_Type::generate( [
						'content'  => String_Prop_Type::generate( 'Menu Item' ),
						'children' => [],
					] ),
					'tag' => String_Prop_Type::generate( 'span' ),
				] )
				->build(),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-mega-menu-item' => __DIR__ . '/atomic-mega-menu-item.html.twig',
		];
	}

	protected function build_template_context(): array {
		$menu_context = Render_Context::get( Atomic_Mega_Menu::class );
		$get_item_index = $menu_context['get-item-index'];
		$mega_menu_id = $menu_context['mega-menu-id'];

		$index = $get_item_index( $this->get_id() );

		return array_merge( $this->build_base_template_context(), [
			'item_id' => Atomic_Mega_Menu::get_item_id( $mega_menu_id, $index ),
			'panel_id' => Atomic_Mega_Menu::get_panel_id( $mega_menu_id, $index ),
		] );
	}
}
