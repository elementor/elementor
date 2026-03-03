<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu_Panel;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu\Atomic_Mega_Menu;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
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

class Atomic_Mega_Menu_Panel extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'llm_support', false );
	}

	public static function get_type() {
		return 'e-mega-menu-panel';
	}

	public static function get_element_type(): string {
		return 'e-mega-menu-panel';
	}

	public function get_title() {
		return esc_html__( 'Mega Menu Panel', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'menu', 'panel', 'dropdown' ];
	}

	public function get_icon() {
		return 'eicon-inner-section';
	}

	public function should_show_in_panel() {
		return false;
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
			'display' => String_Prop_Type::generate( 'block' ),
			'position' => String_Prop_Type::generate( 'absolute' ),
			'min-width' => Size_Prop_Type::generate( [
				'size' => 200,
				'unit' => 'px',
			] ),
			'padding' => Size_Prop_Type::generate( [
				'size' => 16,
				'unit' => 'px',
			] ),
			'background' => Background_Prop_Type::generate( [
				'color' => Color_Prop_Type::generate( '#FFFFFF' ),
			] ),
		];

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( $styles )
				),
		];
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();
		$settings = $this->get_atomic_settings();
		$base_style_class = $this->get_base_styles_dictionary()[ static::BASE_STYLE_KEY ];
		$initial_attributes = $this->define_initial_attributes();

		$menu_context = Render_Context::get( Atomic_Mega_Menu::class );
		$get_panel_index = $menu_context['get-panel-index'];
		$mega_menu_id = $menu_context['mega-menu-id'];

		$index = $get_panel_index( $this->get_id() );

		$attributes = [
			'class' => [
				'e-con',
				'e-atomic-element',
				$base_style_class,
				...( $settings['classes'] ?? [] ),
			],
			'x-bind' => 'panel',
			'id' => Atomic_Mega_Menu::get_panel_id( $mega_menu_id, $index ),
			'aria-labelledby' => Atomic_Mega_Menu::get_item_id( $mega_menu_id, $index ),
			'hidden' => 'true',
			'style' => 'display: none;',
		];

		if ( ! empty( $settings['_cssid'] ) ) {
			$attributes['id'] = esc_attr( $settings['_cssid'] );
		}

		$this->add_render_attribute( '_wrapper', array_merge( $initial_attributes, $attributes ) );
	}
}
