<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\Render_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Tab extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	public static function get_type() {
		return 'e-tab';
	}

	public static function get_element_type(): string {
		return 'e-tab';
	}

	public function get_title() {
		return esc_html__( 'Tab trigger', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-layout';
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
			'cursor' => String_Prop_Type::generate( 'pointer' ),
			'color' => Color_Prop_Type::generate( '#0C0D0E' ),
			'border-style' => String_Prop_Type::generate( 'solid' ),
			'border-color' => Color_Prop_Type::generate( '#E0E0E0' ),
			'border-width' => Size_Prop_Type::generate( [
				'size' => 2,
				'unit' => 'px',
			]),
			'padding' => Size_Prop_Type::generate( [
				'size' => 8,
				'unit' => 'px',
			]),
			'width' => Size_Prop_Type::generate( [
				'size' => 160,
				'unit' => 'px',
			]),
			'background' => Background_Prop_Type::generate( [
				'color' => Color_Prop_Type::generate( '#FFFFFF' ),
			]),
		];

		$selected_styles = [
			'outline-width' => Size_Prop_Type::generate( [
				'size' => 0,
				'unit' => 'px',
			]),
			'border-color' => Color_Prop_Type::generate( '#0C0D0E' ),
		];

		$hover_styles = [
			'background' => Background_Prop_Type::generate( [
				'color' => Color_Prop_Type::generate( '#E0E0E0' ),
			]),
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
						->set_state( Style_States::FOCUS )
						->add_props( $selected_styles )
				)
				->add_variant(
					Style_Variant::make()
						->set_state( Style_States::HOVER )
						->add_props( $hover_styles )
				),
		];
	}

	protected function define_initial_attributes() {
		return [
			'role' => 'tab',
			'tabindex' => '-1',
		];
	}

	protected function define_default_html_tag() {
		return 'button';
	}

	protected function define_default_children() {
		return [
			Atomic_Paragraph::generate()
				->settings( [
					'paragraph' => String_Prop_Type::generate( 'Tab' ),
					'tag' => String_Prop_Type::generate( 'span' ),
				] )
				->build(),
		];
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();
		$settings = $this->get_atomic_settings();
		$base_style_class = $this->get_base_styles_dictionary()[ static::BASE_STYLE_KEY ];
		$initial_attributes = $this->define_initial_attributes();

		$tabs_context = Render_Context::get( Atomic_Tabs::class );
		$default_active_tab = $tabs_context['default-active-tab'];
		$get_tab_index = $tabs_context['get-tab-index'];
		$tabs_id = $tabs_context['tabs-id'];

		$index = $get_tab_index( $this->get_id() );
		$is_active = $default_active_tab === $index;

		$attributes = [
			'class' => [
				'e-con',
				'e-atomic-element',
				$base_style_class,
				...( $settings['classes'] ?? [] ),
			],
			'tabindex' => $is_active ? '0' : '-1',
			'aria-selected' => $is_active ? 'true' : 'false',
			'x-bind' => 'tab',
			'x-ref' => $this->get_id(),
			'id' => Atomic_Tabs::get_tab_id( $tabs_id, $index ),
			'aria-controls' => Atomic_Tabs::get_tab_content_id( $tabs_id, $index ),
		];

		if ( ! empty( $settings['_cssid'] ) ) {
			$attributes['id'] = esc_attr( $settings['_cssid'] );
		}

		$this->add_render_attribute( '_wrapper', array_merge( $initial_attributes, $attributes ) );
	}
}
