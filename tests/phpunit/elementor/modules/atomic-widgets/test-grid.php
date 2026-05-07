<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Grid\Grid;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Grid extends Elementor_Test_Base {

	protected $instance;

	public function setUp(): void {
		parent::setUp();

		// Grid is registered behind the e_css_grid experiment, which defaults to inactive.
		// Register it directly so the elements manager can instantiate it for the test.
		if ( ! Plugin::$instance->elements_manager->get_element_types( Grid::get_element_type() ) ) {
			Plugin::$instance->elements_manager->register_element_type( new Grid() );
		}

		$mock = [
			'id' => 'e8e55a1',
			'elType' => Grid::get_element_type(),
			'settings' => [],
			'widgetType' => Grid::get_element_type(),
		];

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $mock );
	}

	public function test__element_type_is_e_grid(): void {
		$this->assertSame( 'e-grid', Grid::get_element_type() );
	}

	public function test__render_grid(): void {
		// Arrange.
		$mock_child = [
			'id' => 'a3v23u9',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$this->instance->add_child( $mock_child );

		// Act.
		ob_start();
		$this->instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( '<div', $rendered_output );
		$this->assertStringContainsString( 'e-con', $rendered_output );
		$this->assertStringContainsString( 'e-atomic-element', $rendered_output );
		$this->assertStringContainsString( 'data-element_type="e-grid"', $rendered_output );
	}
}
