<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_List\Atomic_List;
use Elementor\Modules\AtomicWidgets\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Atomic_List extends Elementor_Test_Base {
	public function test_default_children_seed_two_numbered_items(): void {
		$children = Plugin::$instance->elements_manager->get_element_types( 'e-list' )->get_config()['default_children'];

		$this->assertCount( 2, $children );

		foreach ( $children as $index => $item ) {
			$this->assertSame( 'e-list-item', $item['elType'] );
			$this->assertSame( 'Item ' . ( $index + 1 ), $item['editor_settings']['title'] );
			$this->assertSame( $index + 1, $item['editor_settings']['initial_position'] );
			$this->assertTrue( $item['settings']['show_markers']['value'] );

			$content = $item['elements'][0];
			$this->assertSame( 'e-list-item-content', $content['elType'] );

			$paragraph = $content['elements'][0];
			$this->assertSame( 'widget', $paragraph['elType'] );
			$this->assertSame( 'e-paragraph', $paragraph['widgetType'] );
			$this->assertSame( 'escaped-html', $paragraph['settings']['paragraph']['$$type'] );
			$this->assertSame( 'List item ' . ( $index + 1 ), $paragraph['settings']['paragraph']['value'] );
		}
	}

	public function test__render_list_emits_default_style_tag_class(): void {
		// Arrange.
		$instance = new Atomic_List( [
			'id' => 'e8e55a1',
			'elType' => Atomic_List::get_element_type(),
			'settings' => [],
		] );

		// Act.
		ob_start();
		$instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( '<ul', $rendered_output );
		$this->assertStringContainsString( 'e-default-ul', $rendered_output );
	}

	public function test_list_editor_handles_are_reset_inside_default_style_roots(): void {
		wp_register_style( 'elementor-frontend', 'https://example.com/frontend.css' );
		wp_register_style( 'elementor-editor', 'https://example.com/editor.css' );

		$module = ( new ReflectionClass( Module::class ) )->newInstanceWithoutConstructor();
		$method = new ReflectionMethod( Module::class, 'add_inline_styles' );
		$method->setAccessible( true );

		$method->invoke( $module );

		$frontend_inline_styles = wp_styles()->get_data( 'elementor-frontend', 'after' );
		$editor_inline_styles = wp_styles()->get_data( 'elementor-editor', 'after' );
		$expected_rule = '.e-default-ul > .elementor-element-overlay > .elementor-editor-element-settings, .e-default-li > .elementor-element-overlay > .elementor-editor-element-settings { list-style: none; margin: 0; padding: 0; }';

		$this->assertIsArray( $frontend_inline_styles );
		$this->assertIsArray( $editor_inline_styles );
		$this->assertContains( $expected_rule, $frontend_inline_styles );
		$this->assertContains( $expected_rule, $editor_inline_styles );

		wp_deregister_style( 'elementor-frontend' );
		wp_deregister_style( 'elementor-editor' );
	}
}
