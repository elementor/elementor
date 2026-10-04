<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List\Atomic_List;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item\Atomic_List_Item;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item_Content\Atomic_List_Item_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item_Marker\Atomic_List_Item_Marker;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * @group atomic-widgets-e-list
 */
class Test_Atomic_List_Item extends Elementor_Test_Base {
	private function get_config( string $type ): array {
		$element_type = Plugin::$instance->elements_manager->get_element_types( $type );
		$this->assertNotNull( $element_type, "Element type {$type} is not registered." );

		return $element_type->get_config();
	}

	public function test_list_element_is_registered(): void {
		$config = $this->get_config( Atomic_List::get_element_type() );

		$this->assertIsArray( $config );
	}

	public function test_get_data_for_save__preserves_sanitized_editor_settings_label(): void {
		// Arrange.
		$instance = new Atomic_List_Item( [
			'id' => 'list-item-1',
			'elType' => 'e-list-item',
			'editor_settings' => [
				'title' => '<b>Primary item</b>',
			],
		] );

		// Act.
		$data_for_save = $instance->get_data_for_save();

		// Assert.
		$this->assertSame(
			[
				'title' => 'Primary item',
			],
			$data_for_save['editor_settings']
		);
	}

	public function test_default_children_include_hydrated_content_slot(): void {
		$children = $this->get_config( Atomic_List_Item::get_element_type() )['default_children'];

		$this->assertCount( 1, $children );
		$this->assertSame( Atomic_List_Item_Content::get_element_type(), $children[0]['elType'] );
		$this->assertTrue( $children[0]['hydrateDefaultChildren'] );
	}

	public function test_content_slot_default_children_include_list_item_paragraph(): void {
		$children = $this->get_config( Atomic_List_Item_Content::get_element_type() )['default_children'];

		$this->assertCount( 1, $children );
		$this->assertSame( 'widget', $children[0]['elType'] );
		$this->assertSame( 'e-paragraph', $children[0]['widgetType'] );
		$this->assertSame( 'escaped-html', $children[0]['settings']['paragraph']['$$type'] );
		$this->assertSame( 'List item', $children[0]['settings']['paragraph']['value'] );
	}

	public function test_marker_slot_uses_single_line_height(): void {
		$props = $this->get_config( Atomic_List_Item_Marker::get_element_type() )['base_styles']['e-list-item-marker-base']['variants'][0]['props'];

		$this->assertSame(
			[
				'$$type' => 'size',
				'value' => [
					'size' => '1lh',
					'unit' => 'custom',
				],
			],
			$props['height']
		);
	}

	public function test_marker_slot_centers_marker_content(): void {
		$props = $this->get_config( Atomic_List_Item_Marker::get_element_type() )['base_styles']['e-list-item-marker-base']['variants'][0]['props'];

		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'flex',
			],
			$props['display']
		);

		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'center',
			],
			$props['align-items']
		);
	}

	public function test_marker_slot_default_children_seed_list_marker_paragraph(): void {
		$children = $this->get_config( Atomic_List_Item_Marker::get_element_type() )['default_children'];

		$this->assertCount( 1, $children );
		$paragraph = $children[0];

		$this->assertSame( 'widget', $paragraph['elType'] );
		$this->assertSame( 'e-paragraph', $paragraph['widgetType'] );
		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'span',
			],
			$paragraph['settings']['tag']
		);

		$this->assertSame(
			[
				'$$type' => 'escaped-html',
				'value' => '&bull;',
			],
			$paragraph['settings']['paragraph']
		);
	}

	public function test_marker_children_dependency_stashes_marker_when_hidden(): void {
		$dependencies = $this->get_config( Atomic_List_Item::get_element_type() )['children_dependencies'];

		$this->assertCount( 1, $dependencies );
		$this->assertSame( Atomic_List_Item_Marker::get_element_type(), $dependencies[0]['child_type'] );
		$this->assertTrue( $dependencies[0]['stash'] );
		$this->assertSame( 'eq', $dependencies[0]['when']['terms'][0]['operator'] );
		$this->assertSame( [ 'show_markers' ], $dependencies[0]['when']['terms'][0]['path'] );
		$this->assertTrue( $dependencies[0]['when']['terms'][0]['value'] );
		$this->assertSame( 'first', $dependencies[0]['position']['kind'] );
		$this->assertSame( Atomic_List_Item_Marker::get_element_type(), $dependencies[0]['default_model']['elType'] );
		$this->assertTrue( $dependencies[0]['default_model']['hydrateDefaultChildren'] );
	}
}
