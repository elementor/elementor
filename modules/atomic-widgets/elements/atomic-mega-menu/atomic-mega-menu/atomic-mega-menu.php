<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu_Nav\Atomic_Mega_Menu_Nav;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu_Item\Atomic_Mega_Menu_Item;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu_Content_Area\Atomic_Mega_Menu_Content_Area;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Mega_Menu\Atomic_Mega_Menu_Panel\Atomic_Mega_Menu_Panel;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Elements\Loader\Frontend_Assets_Loader;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Core\Utils\Collection;
use Elementor\Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Mega_Menu extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';
	const ELEMENT_TYPE_NAV = 'e-mega-menu-nav';
	const ELEMENT_TYPE_CONTENT_AREA = 'e-mega-menu-content-area';
	const ELEMENT_TYPE_ITEM = 'e-mega-menu-item';
	const ELEMENT_TYPE_PANEL = 'e-mega-menu-panel';

	const DEFAULT_ITEM_COUNT = 3;

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-mega-menu';
	}

	public static function get_element_type(): string {
		return 'e-mega-menu';
	}

	public function get_title() {
		return esc_html__( 'Mega Menu', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'menu', 'mega', 'nav', 'navigation' ];
	}

	public function get_icon() {
		return 'eicon-nav-menu';
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
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [] ),
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

	protected function define_default_html_tag() {
		return 'nav';
	}

	protected function define_base_styles(): array {
		$styles = [
			'display' => String_Prop_Type::generate( 'flex' ),
			'flex-direction' => String_Prop_Type::generate( 'column' ),
			'position' => String_Prop_Type::generate( 'relative' ),
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
		$item_elements = [];
		$panel_elements = [];

		foreach ( range( 1, self::DEFAULT_ITEM_COUNT ) as $i ) {
			$item_elements[] = Atomic_Mega_Menu_Item::generate()
				->editor_settings( [
					'title' => "Menu Item {$i}",
					'initial_position' => $i,
				] )
				->is_locked( true )
				->build();

			$panel_elements[] = Atomic_Mega_Menu_Panel::generate()
				->is_locked( true )
				->editor_settings( [
					'title' => "Panel {$i}",
					'initial_position' => $i,
				] )
				->build();
		}

		$nav = Atomic_Mega_Menu_Nav::generate()
			->children( $item_elements )
			->is_locked( true )
			->build();

		$content_area = Atomic_Mega_Menu_Content_Area::generate()
			->children( $panel_elements )
			->is_locked( true )
			->build();

		return [
			$nav,
			$content_area,
		];
	}

	public function get_script_depends() {
		$global_depends = parent::get_script_depends();

		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return array_merge( $global_depends, [ 'elementor-mega-menu-handler', 'elementor-mega-menu-preview-handler' ] );
		}

		return array_merge( $global_depends, [ 'elementor-mega-menu-handler' ] );
	}

	public function register_frontend_handlers() {
		$assets_url = ELEMENTOR_ASSETS_URL;
		$min_suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			'elementor-mega-menu-handler',
			"{$assets_url}js/mega-menu-handler{$min_suffix}.js",
			[ Frontend_Assets_Loader::FRONTEND_HANDLERS_HANDLE, Frontend_Assets_Loader::ALPINEJS_HANDLE ],
			ELEMENTOR_VERSION,
			true
		);

		wp_register_script(
			'elementor-mega-menu-preview-handler',
			"{$assets_url}js/mega-menu-preview-handler{$min_suffix}.js",
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

	private function get_item_index( $item_id ) {
		$direct_children = Collection::make( $this->get_children() );
		$nav = $direct_children->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_NAV )->first();

		$item_ids = $this->get_filtered_children_ids( $nav, self::ELEMENT_TYPE_ITEM );

		return $item_ids[ $item_id ];
	}

	private function get_panel_index( $panel_id ) {
		$direct_children = Collection::make( $this->get_children() );
		$content_area = $direct_children->filter( fn( $child ) => $child->get_type() === self::ELEMENT_TYPE_CONTENT_AREA )->first();

		$panel_ids = $this->get_filtered_children_ids( $content_area, self::ELEMENT_TYPE_PANEL );

		return $panel_ids[ $panel_id ];
	}

	protected function define_render_context(): array {
		return [
			'context' => [
				'get-item-index' => fn( $item_id ) => $this->get_item_index( $item_id ),
				'get-panel-index' => fn( $panel_id ) => $this->get_panel_index( $panel_id ),
				'mega-menu-id' => $this->get_id(),
			],
		];
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();
		$settings = $this->get_atomic_settings();
		$base_style_class = $this->get_base_styles_dictionary()[ static::BASE_STYLE_KEY ];
		$initial_attributes = $this->define_initial_attributes();

		$attributes = [
			'class' => [
				'e-con',
				'e-atomic-element',
				$base_style_class,
				...( $settings['classes'] ?? [] ),
			],
			'role' => 'navigation',
			'x-data' => 'eMegaMenu' . $this->get_id(),
			'data-e-settings' => wp_json_encode( [] ),
		];

		if ( ! empty( $settings['_cssid'] ) ) {
			$attributes['id'] = esc_attr( $settings['_cssid'] );
		}

		$this->add_render_attribute( '_wrapper', array_merge( $initial_attributes, $attributes ) );
	}

	public static function get_item_id( $mega_menu_id, $index ) {
		return "{$mega_menu_id}-item-{$index}";
	}

	public static function get_panel_id( $mega_menu_id, $index ) {
		return "{$mega_menu_id}-panel-{$index}";
	}
}
