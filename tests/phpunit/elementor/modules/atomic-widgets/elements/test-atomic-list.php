<?php

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Html_Tag_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List\Atomic_List;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item_Content\Atomic_List_Item_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item\Atomic_List_Item;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item_Marker\Atomic_List_Item_Marker;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_List extends Elementor_Test_Base {

	public function test_props_schema_includes_show_markers_boolean_prop() {
		$schema = Atomic_List::get_props_schema();

		$this->assertArrayHasKey( 'show_markers', $schema );
		$this->assertInstanceOf( Prop_Type::class, $schema['show_markers'] );
		$this->assertSame(
			[
				'$$type' => 'boolean',
				'value' => true,
			],
			$schema['show_markers']->get_default()
		);
	}

	public function test_props_schema_includes_tag_string_prop_with_description() {
		$schema = Atomic_List::get_props_schema();

		$this->assertArrayHasKey( 'tag', $schema );
		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'ul',
			],
			$schema['tag']->get_default()
		);
		$this->assertSame(
			'Internal HTML tag selection. The UI keeps this control read-only and saved output is currently normalized to unordered lists.',
			$schema['tag']->get_meta_item( 'description' )
		);
	}

	public function test_tag_prop_is_readonly_in_the_editor_schema() {
		$schema = Atomic_List::get_props_schema();
		$dependencies = $schema['tag']->get_dependencies();

		$this->assertNotNull( $dependencies );
		$this->assertSame( 'and', $dependencies['relation'] );
		$this->assertSame( [ 'tag' ], $dependencies['terms'][0]['path'] );
		$this->assertSame( '__read_only__', $dependencies['terms'][0]['value'] );
		$this->assertSame( 'disable', $dependencies['terms'][0]['effect'] );
		$this->assertArrayNotHasKey( 'newValue', $dependencies['terms'][0] );
	}

	public function test_show_markers_no_longer_depends_on_tag() {
		$schema = Atomic_List::get_props_schema();

		$this->assertNull( $schema['show_markers']->get_dependencies() );
	}

	public function test_show_markers_switch_control_is_registered() {
		$list = $this->make_atomic_list_instance();

		$show_markers = $this->find_control_by_bind( $list->get_atomic_controls(), 'show_markers' );

		$this->assertInstanceOf( Switch_Control::class, $show_markers );
		$this->assertSame( 'switch', $show_markers->get_type() );
	}

	public function test_html_tag_control_is_registered() {
		$list = $this->make_atomic_list_instance();

		$html_tag = $this->find_control_by_bind( $list->get_atomic_controls(), 'tag' );

		$this->assertInstanceOf( Html_Tag_Control::class, $html_tag );
		$this->assertSame( 'html-tag', $html_tag->get_type() );
	}

	public function test_list_elements_define_widget_descriptions() {
		$this->assertNotEmpty( Atomic_List::$widget_description );
		$this->assertNotEmpty( Atomic_List_Item::$widget_description );
		$this->assertNotEmpty( Atomic_List_Item_Marker::$widget_description );
		$this->assertNotEmpty( Atomic_List_Item_Content::$widget_description );
	}

	public function test_list_item_label_is_preserved_in_editor_settings_when_saved() {
		$list_item = new Atomic_List_Item( [
			'id' => 'test_atomic_list_item_instance',
			'elType' => Atomic_List_Item::get_type(),
			'settings' => [],
			'editor_settings' => [
				'label' => '<b>Renamed item</b>',
			],
		], null );

		$data_for_save = $list_item->get_data_for_save();

		$this->assertSame(
			[
				'label' => 'Renamed item',
			],
			$data_for_save['editor_settings']
		);
	}

	public function test_list_item_marker_base_styles_keep_marker_slot_at_content_width() {
		$marker = new Atomic_List_Item_Marker( [
			'id' => 'test_atomic_list_item_marker_instance',
			'elType' => Atomic_List_Item_Marker::get_type(),
			'settings' => [],
		], null );

		$props = array_values( $marker->get_base_styles() )[0]['variants'][0]['props'];

		$this->assertSame( 'fit-content', $props['width']['value']['size'] );
		$this->assertSame( 'custom', $props['width']['value']['unit'] );
		$this->assertSame( 0, $props['flex']['value']['flexGrow'] );
		$this->assertSame( 0, $props['flex']['value']['flexShrink'] );
		$this->assertSame( 'auto', $props['flex']['value']['flexBasis']['value']['size'] );
		$this->assertSame( 'custom', $props['flex']['value']['flexBasis']['value']['unit'] );
	}

	public function test_list_item_content_base_styles_expand_content_slot_to_remaining_space() {
		$content = new Atomic_List_Item_Content( [
			'id' => 'test_atomic_list_item_content_instance',
			'elType' => Atomic_List_Item_Content::get_type(),
			'settings' => [],
		], null );

		$props = array_values( $content->get_base_styles() )[0]['variants'][0]['props'];

		$this->assertSame( 'auto', $props['width']['value']['unit'] );
		$this->assertSame( 1, $props['flex']['value']['flexGrow'] );
		$this->assertSame( 1, $props['flex']['value']['flexShrink'] );
		$this->assertSame( 0, $props['flex']['value']['flexBasis']['value']['size'] );
		$this->assertSame( 'px', $props['flex']['value']['flexBasis']['value']['unit'] );
		$this->assertSame( 0, $props['min-width']['value']['size'] );
		$this->assertSame( 'px', $props['min-width']['value']['unit'] );
	}

	public function test_default_children_seed_a_compact_marker_svg_style() {
		$list = $this->make_atomic_list_instance();
		$default_children = $this->invoke_method( $list, 'define_default_children' );
		$default_marker_svg = $default_children[0]['elements'][0]['elements'][0];
		$marker_icon_style = $default_marker_svg['styles'][0];
		$props = $marker_icon_style['variants'][0]['props'];

		$this->assertSame( Atomic_Svg::get_element_type(), $default_marker_svg['widgetType'] );
		$this->assertSame(
			[
				'$$type' => 'classes',
				'value' => [ Atomic_List::DEFAULT_MARKER_ICON_STYLE_ID ],
			],
			$default_marker_svg['settings']['classes']
		);
		$this->assertSame( Atomic_List::DEFAULT_MARKER_ICON_STYLE_ID, $marker_icon_style['id'] );
		$this->assertSame( 1, $props['width']['value']['size'] );
		$this->assertSame( 'rem', $props['width']['value']['unit'] );
		$this->assertSame( 1, $props['height']['value']['size'] );
		$this->assertSame( 'rem', $props['height']['value']['unit'] );
	}

	public function test_tag_is_normalized_to_ul_when_saved() {
		$list = new Atomic_List( [
			'id' => 'test_atomic_list_instance',
			'elType' => Atomic_List::get_type(),
			'settings' => [
				'tag' => [
					'$$type' => 'string',
					'value' => 'ol',
				],
			],
		], null );

		$data_for_save = $list->get_data_for_save();

		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'ul',
			],
			$data_for_save['settings']['tag']
		);
	}

	public function test_render_markdown_uses_unordered_bullets_for_ul() {
		$list = new class( [
			'id' => 'test_atomic_list_instance',
			'elType' => Atomic_List::get_type(),
			'settings' => [],
		], null ) extends Atomic_List {
			public array $test_children = [];
			public array $resolved_settings = [ 'tag' => 'ul' ];

			public function get_children() {
				return $this->test_children;
			}

			public function get_atomic_setting( string $key ) {
				return $this->resolved_settings[ $key ] ?? null;
			}
		};

		$list->test_children = [
			$this->create_markdown_list_item( 'First item' ),
			$this->create_markdown_list_item( 'Second item' ),
		];

		$this->assertSame( "- First item\n- Second item", $list->render_markdown() );
	}

	public function test_render_markdown_uses_ordered_numbering_for_ol() {
		$list = new class( [
			'id' => 'test_atomic_list_instance',
			'elType' => Atomic_List::get_type(),
			'settings' => [],
		], null ) extends Atomic_List {
			public array $test_children = [];
			public array $resolved_settings = [ 'tag' => 'ol' ];

			public function get_children() {
				return $this->test_children;
			}

			public function get_atomic_setting( string $key ) {
				return $this->resolved_settings[ $key ] ?? null;
			}
		};

		$list->test_children = [
			$this->create_markdown_list_item( 'First item' ),
			$this->create_markdown_list_item( 'Second item' ),
		];

		$this->assertSame( "1. First item\n2. Second item", $list->render_markdown() );
	}

	private function find_control_by_bind( array $controls, string $bind ): ?Atomic_Control_Base {
		foreach ( $controls as $control ) {
			if ( $control instanceof Section ) {
				$found = $this->find_control_by_bind( $control->get_items(), $bind );

				if ( null !== $found ) {
					return $found;
				}

				continue;
			}

			if ( $control instanceof Atomic_Control_Base && $control->get_bind() === $bind ) {
				return $control;
			}
		}

		return null;
	}

	private function make_atomic_list_instance(): Atomic_List {
		return new Atomic_List( [
			'id' => 'test_atomic_list_instance',
			'elType' => Atomic_List::get_type(),
			'settings' => [],
		], null );
	}

	private function invoke_method( object $instance, string $method_name ) {
		$method = new ReflectionMethod( $instance, $method_name );
		$method->setAccessible( true );

		return $method->invoke( $instance );
	}

	private function create_markdown_list_item( string $markdown ): object {
		$content_child = new class( $markdown ) {
			private string $markdown;

			public function __construct( string $markdown ) {
				$this->markdown = $markdown;
			}

			public function render_markdown(): string {
				return $this->markdown;
			}
		};

		$content_slot = new class( $content_child ) {
			private object $content_child;

			public function __construct( object $content_child ) {
				$this->content_child = $content_child;
			}

			public function get_type() {
				return Atomic_List_Item_Content::get_element_type();
			}

			public function get_children() {
				return [ $this->content_child ];
			}
		};

		return new class( $content_slot ) {
			private object $content_slot;

			public function __construct( object $content_slot ) {
				$this->content_slot = $content_slot;
			}

			public function get_type() {
				return Atomic_List_Item::get_element_type();
			}

			public function get_children() {
				return [ $this->content_slot ];
			}
		};
	}
}
