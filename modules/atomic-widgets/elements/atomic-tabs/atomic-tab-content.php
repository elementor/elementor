<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Selection_Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transition_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Render_Context;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Tab_Content extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	public static function get_type() {
		return 'e-tab-content';
	}

	public static function get_element_type(): string {
		return 'e-tab-content';
	}

	public function get_title() {
		return esc_html__( 'Tab content', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'tab', 'content', 'tabs' ];
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
			'tab-id' => String_Prop_Type::make(),
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
		$display = String_Prop_Type::generate( 'block' );

		$hidden_opacity = Size_Prop_Type::generate( [
			'size' => 0,
			'unit' => '%',
		] );

		$visible_opacity = Size_Prop_Type::generate( [
			'size' => 100,
			'unit' => '%',
		] );

		$transition = Transition_Prop_Type::generate( [
			Selection_Size_Prop_Type::generate( [
				'selection' => Key_Value_Prop_Type::generate( [
					'value' => 'opacity',
				] ),
				'size' => Size_Prop_Type::generate( [
					'size' => 600,
					'unit' => 'ms',
				] ),
			] ),
		] );

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', $display )
						->add_prop( 'padding', $this->get_base_padding() )
						->add_prop( 'min-width', $this->get_base_min_width() )
						->add_prop( 'opacity', $hidden_opacity )
						->add_prop( 'transition', $transition )
				)
				->add_variant(
					Style_Variant::make()
						->set_state( Style_States::SELECTED )
						->add_prop( 'opacity', $visible_opacity )
				),
		];
	}

	protected function get_base_padding(): array {
		return Size_Prop_Type::generate( [
			'size' => 10,
			'unit' => 'px',
		] );
	}

	protected function get_base_min_width(): array {
		return Size_Prop_Type::generate( [
			'size' => 30,
			'unit' => 'px',
		] );
	}

	protected function define_initial_attributes() {
		return [
			'role' => 'tabpanel',
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Paragraph::generate()
				->settings( [
					'text' => String_Prop_Type::generate( 'Tab Content' ),
				] )
				->build(),
		];
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();
		$settings = $this->get_atomic_settings();
		$base_style_class = $this->get_base_styles_dictionary()[ static::BASE_STYLE_KEY ];
		$initial_attributes = $this->define_initial_attributes();

		$default_active_tab = Render_Context::get( Atomic_Tabs::class )['default-active-tab'] ?? null;
		$is_active = $default_active_tab === $this->get_atomic_setting( 'tab-id' );

		$attributes = [
			'class' => [
				'e-con',
				'e-atomic-element',
				$base_style_class,
				...( $settings['classes'] ?? [] ),
			],
		];

		if ( ! $is_active ) {
			$attributes['hidden'] = 'true';
			$attributes['style'] = 'display: none;';
		}

		if ( ! empty( $settings['tab-id'] ) ) {
			$attributes['data-tab-id'] = esc_attr( $settings['tab-id'] );
			$attributes['aria-labelledby'] = esc_attr( $settings['tab-id'] );
		}

		if ( ! empty( $settings['_cssid'] ) ) {
			$attributes['id'] = esc_attr( $settings['_cssid'] );
		}

		$this->add_render_attribute( '_wrapper', array_merge( $initial_attributes, $attributes ) );
	}
}
