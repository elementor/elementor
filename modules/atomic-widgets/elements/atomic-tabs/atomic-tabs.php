<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Tabs;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Controls\Types\Elements\Tabs_Control;
use Elementor\Core\Utils\Collection;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Tabs extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	public static function get_type() {
		return 'e-tabs';
	}

	public static function get_element_type(): string {
		return 'e-tabs';
	}

	public function get_title() {
		return esc_html__( 'Tabs', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-tabs';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'default-active-tab' => Number_Prop_Type::make()
				->default( 0 ),
			'attributes' => Attributes_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [
					Tabs_Control::make()
					->set_label( __( 'Menu items', 'elementor' ) )
					->set_meta( [
						'layout' => 'custom',
					] ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( [
							'layout' => 'two-columns',
						] ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		$display = String_Prop_Type::generate( 'block' );

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', $display )
						->add_prop( 'padding', $this->get_base_padding() )
						->add_prop( 'min-width', $this->get_base_min_width() )
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

	protected function define_default_children() {
		$default_tab_count = 3;
		$tab_elements = [];
		$tab_content_elements = [];

		foreach ( range( 1, $default_tab_count ) as $i ) {
			$tab_elements[] = Atomic_Tab::generate()
				->editor_settings( [
					'title' => "Tab {$i} trigger",
				] )
				->is_locked( true )
				->build();

			$tab_content_elements[] = Atomic_Tab_Content::generate()
				->is_locked( true )
				->editor_settings( [
					'title' => "Tab {$i} content",
				] )
				->build();
		}

		$tabs_menu = Atomic_Tabs_Menu::generate()
			->children( $tab_elements )
			->is_locked( true )
			->build();

		$tabs_content_area = Atomic_Tabs_Content_Area::generate()
			->children( $tab_content_elements )
			->is_locked( true )
			->build();

		return [
			$tabs_menu,
			$tabs_content_area,
		];
	}

	public function define_initial_attributes() {
		return [
			'data-e-type' => $this->get_type(),
		];
	}

	public function get_script_depends() {
		return [ 'elementor-tabs-handler' ];
	}

	public static function register_handler_scripts( $assets_url, $min_suffix, $frontend_handlers_handle, $alpinejs_handle ) {
		wp_register_script(
			'elementor-tabs-handler',
			"{$assets_url}js/tabs-handler{$min_suffix}.js",
			[ $frontend_handlers_handle, $alpinejs_handle ],
			ELEMENTOR_VERSION,
			true
		);
	}

	protected function define_render_context(): array {
		$default_active_tab = $this->get_atomic_setting( 'default-active-tab' );
		
		$direct_children = Collection::make( $this->get_children() );
		
		$tabs_menu = $direct_children->filter( fn( $child ) => $child->get_type() === 'e-tabs-menu' )->first();
		$tabs_content_area = $direct_children->filter( fn( $child ) => $child->get_type() === 'e-tabs-content-area' )->first();
		
		$tabs_map = Collection::make( $tabs_menu ? $tabs_menu->get_children() : [] )
			->filter( fn( $element ) => $element->get_type() === 'e-tab' )
			->map( fn( $element ) => $element->get_id() )
			->flip()
			->all();
		
		$tabs_content_map = Collection::make( $tabs_content_area ? $tabs_content_area->get_children() : [] )
			->filter( fn( $element ) => $element->get_type() === 'e-tab-content' )
			->map( fn( $element ) => $element->get_id() )
			->flip()
			->all();

		return [
			'default-active-tab' => $default_active_tab,
			'tabs-map' => $tabs_map,
			'tabs-content-map' => $tabs_content_map,
			'tabs-id' => $this->get_id(),
		];
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();
		$settings = $this->get_atomic_settings();
		$base_style_class = $this->get_base_styles_dictionary()[ static::BASE_STYLE_KEY ];
		$initial_attributes = $this->define_initial_attributes();

		$default_active_tab = $settings['default-active-tab'] ?? 0;
		$default_active_tab_id = static::get_tab_id( $this->get_id(), $default_active_tab );

		$attributes = [
			'class' => [
				'e-con',
				'e-atomic-element',
				$base_style_class,
				...( $settings['classes'] ?? [] ),
			],
			'x-data' => 'atomicTabs',
			'data-e-settings' => json_encode( [ 'default-active-tab' => esc_js( $default_active_tab_id ) ] ),
		];

		if ( ! empty( $settings['_cssid'] ) ) {
			$attributes['id'] = esc_attr( $settings['_cssid'] );
		}

		$this->add_render_attribute( '_wrapper', array_merge( $initial_attributes, $attributes ) );
	}
	
	public static function get_tab_id( $tabs_id, $index ) {
		return "{$tabs_id}-tab-{$index}";
	}

	public static function get_tab_content_id( $tabs_id, $index ) {
		return "{$tabs_id}-tab-content-{$index}";
	}
}
