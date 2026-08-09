<?php

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
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

	public function test_show_markers_switch_control_is_registered() {
		$list = $this->make_atomic_list_instance();

		$show_markers = $this->find_control_by_bind( $list->get_atomic_controls(), 'show_markers' );

		$this->assertInstanceOf( Switch_Control::class, $show_markers );
		$this->assertSame( 'switch', $show_markers->get_type() );
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
}
