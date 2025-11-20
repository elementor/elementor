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
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\Controls\Types\Elements\Tabs_Control;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Loader\Frontend_Assets_Loader;
use Elementor\Utils;
use Elementor\Plugin;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Tabs extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';
	const ELEMENT_TYPE_TABS_MENU = 'e-tabs-menu';
	const ELEMENT_TYPE_TABS_CONTENT_AREA = 'e-tabs-content-area';
	const ELEMENT_TYPE_TAB = 'e-tab';
	const ELEMENT_TYPE_TAB_CONTENT = 'e-tab-content';

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
		$styles = [
			'display' => String_Prop_Type::generate( 'flex' ),
			'flex-direction' => String_Prop_Type::generate( 'column' ),
			'gap' => Size_Prop_Type::generate( [
				'size' => 30,
				'unit' => 'px',
			]),
			'padding' => Dimensions_Prop_Type::generate( [
				'block-start' => Size_Prop_Type::generate( [
					'size' => 0,
					'unit' => 'px',
				]),
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

	protected function define_default_children() {
		$default_tab_count = 3;
		$tab_elements = [];
		$tab_content_elements = [];

		foreach ( range( 1, $default_tab_count ) as $i ) {
			$tab_elements[] = Atomic_Tab::generate()
				->editor_settings( [
					'title' => "Tab {$i} trigger",
					'initial_position' => $i,
				] )
				->is_locked( true )
				->build();

			$tab_content_elements[] = Atomic_Tab_Content::generate()
				->is_locked( true )
				->editor_settings( [
					'title' => "Tab {$i} content",
					'initial_position' => $i,
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
		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return [ 'elementor-tabs-handler', 'elementor-tabs-preview-handler' ];
		}

		return [ 'elementor-tabs-handler' ];
	}

	public function register_frontend_handlers() {
		$assets_url = ELEMENTOR_ASSETS_URL;
		$min_suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			'elementor-tabs-handler',
			"{$assets_url}js/tabs-handler{$min_suffix}.js",
			[ Frontend_Assets_Loader::FRONTEND_HANDLERS_HANDLE, Frontend_Assets_Loader::ALPINEJS_HANDLE ],
			ELEMENTOR_VERSION,
			true
		);

		wp_register_script(
			'elementor-tabs-preview-handler',
			"{$assets_url}js/tabs-preview-handler{$min_suffix}.js",
			[ Frontend_Assets_Loader::FRONTEND_HANDLERS_HANDLE, Frontend_Assets_Loader::ALPINEJS_HANDLE ],
			ELEMENTOR_VERSION,
			true
		);
	}

	private function get_filtered_children_ids( $parent_element, $child_type ) {
		if ( ! $parent_element ) {
			return [];
		}

		return Collection::make( $parent_element->get_children() )
			->filter( fn( $element ) => $element->get_type() === $child_type )
			->map( fn( $element ) => $element->get_id() )
			->flip()
			->all();
	}

	private function get_tab_index( $tab_id ) {
		$direct_children = Collection::make( $this->get_children() );
		$tabs_menu = $direct_children->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_TABS_MENU )->first();

		$tab_ids = $this->get_filtered_children_ids( $tabs_menu, self::ELEMENT_TYPE_TAB );

		return $tab_ids[ $tab_id ];
	}

	private function get_tab_content_index( $tab_content_id ) {
		$direct_children = Collection::make( $this->get_children() );
		$tabs_content_area = $direct_children->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_TABS_CONTENT_AREA )->first();

		$tab_content_ids = $this->get_filtered_children_ids( $tabs_content_area, self::ELEMENT_TYPE_TAB_CONTENT );

		return $tab_content_ids[ $tab_content_id ];
	}

	protected function define_render_context(): array {
		$default_active_tab = $this->get_atomic_setting( 'default-active-tab' );

		return [
			'default-active-tab' => $default_active_tab,
			'get-tab-index' => fn( $tab_id ) => $this->get_tab_index( $tab_id ),
			'get-tab-content-index' => fn( $tab_content_id ) => $this->get_tab_content_index( $tab_content_id ),
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
			'x-data' => 'eTabs' . $this->get_id(),
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
