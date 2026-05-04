<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Grid\Grid;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_E_Grid_Container extends Elementor_Test_Base {

	public function test__render_grid(): void {
		$mock_child = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$mock = [
			'id' => 'e8e55a1',
			'elType' => Grid::get_element_type(),
			'settings' => [],
			'widgetType' => Grid::get_element_type(),
		];

		$instance = Plugin::$instance->elements_manager->create_element_instance( $mock );
		$instance->add_child( $mock_child );

		ob_start();
		$instance->print_element();
		$rendered_output = ob_get_clean();

		$this->assertStringContainsString( 'e-grid-base', $rendered_output );
		$this->assertStringContainsString( 'data-element_type="e-grid"', $rendered_output );
	}
}
