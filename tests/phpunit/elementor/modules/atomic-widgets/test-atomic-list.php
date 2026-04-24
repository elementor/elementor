<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List\Atomic_List;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List_Item\Atomic_List_Item;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Atomic_List extends Elementor_Test_Base {
	public function test__render_unordered_list(): void {
		// Arrange.
		$instance = $this->create_list_instance( 'unordered' );

		// Act.
		ob_start();
		$instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( '<ul ', $rendered_output );
		$this->assertStringContainsString( '</ul>', $rendered_output );
		$this->assertStringNotContainsString( '<ol ', $rendered_output );
		$this->assertSame( 3, substr_count( $rendered_output, '<li ' ) );
		$this->assertStringContainsString( 'Item #1', $rendered_output );
		$this->assertStringContainsString( 'Item #2', $rendered_output );
		$this->assertStringContainsString( 'Item #3', $rendered_output );
	}

	public function test__render_ordered_list(): void {
		// Arrange.
		$instance = $this->create_list_instance( 'ordered' );

		// Act.
		ob_start();
		$instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( '<ol ', $rendered_output );
		$this->assertStringContainsString( '</ol>', $rendered_output );
		$this->assertStringNotContainsString( '<ul ', $rendered_output );
		$this->assertSame( 3, substr_count( $rendered_output, '<li ' ) );
	}

	public function test__list_config_contains_default_locked_items(): void {
		// Arrange.
		$instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'list',
			'elType' => Atomic_List::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_List::get_element_type(),
		] );

		// Act.
		$config = $instance->get_config();
		$children = $config['default_children'];

		// Assert.
		$this->assertTrue( $config['show_in_panel'] );
		$this->assertSame( [ Atomic_List_Item::get_element_type() ], $config['allowed_child_types'] );
		$this->assertSame( 'List Markers', $config['atomic_pseudo_states'][0]['name'] );
		$this->assertSame( ' > li::marker', $config['atomic_pseudo_states'][0]['value'] );
		$this->assertCount( 3, $children );

		foreach ( $children as $index => $child ) {
			$item_number = $index + 1;

			$this->assertSame( Atomic_List_Item::get_element_type(), $child['elType'] );
			$this->assertTrue( $child['isLocked'] );
			$this->assertSame( "Item #{$item_number}", $child['editor_settings']['title'] );
			$this->assertCount( 1, $child['elements'] );
			$this->assertSame( Atomic_Paragraph::get_element_type(), $child['elements'][0]['elType'] );
			$this->assertSame( 'span', $child['elements'][0]['settings']['tag']['value'] );
			$this->assertSame( "Item #{$item_number}", $child['elements'][0]['settings']['paragraph']['value']['content']['value'] );
		}
	}

	public function test__list_item_config_is_internal_and_semantic(): void {
		// Arrange.
		$instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'list-item',
			'elType' => Atomic_List_Item::get_element_type(),
			'settings' => [],
			'widgetType' => Atomic_List_Item::get_element_type(),
		] );

		// Act.
		$config = $instance->get_config();

		// Assert.
		$this->assertFalse( $config['show_in_panel'] );
		$this->assertSame( 'li', $config['default_html_tag'] );
		$this->assertSame( [ Atomic_Paragraph::get_element_type() ], $config['allowed_child_types'] );
		$this->assertSame( 'List Item Marker', $config['atomic_pseudo_states'][0]['name'] );
		$this->assertSame( '::marker', $config['atomic_pseudo_states'][0]['value'] );
	}

	private function create_list_instance( string $list_type ): object {
		$children = [];

		foreach ( range( 1, 3 ) as $index ) {
			$children[] = [
				'id' => "item-{$index}",
				'elType' => Atomic_List_Item::get_element_type(),
				'settings' => [],
				'widgetType' => Atomic_List_Item::get_element_type(),
				'elements' => [
					[
						'id' => "paragraph-{$index}",
						'elType' => 'widget',
						'widgetType' => Atomic_Paragraph::get_element_type(),
						'settings' => [
							'paragraph' => Html_V3_Prop_Type::generate( [
								'content' => String_Prop_Type::generate( "Item #{$index}" ),
								'children' => [],
							] ),
							'tag' => String_Prop_Type::generate( 'span' ),
						],
					],
				],
			];
		}

		return Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'list',
			'elType' => Atomic_List::get_element_type(),
			'settings' => [
				'list-type' => String_Prop_Type::generate( $list_type ),
			],
			'widgetType' => Atomic_List::get_element_type(),
			'elements' => $children,
		] );
	}
}
