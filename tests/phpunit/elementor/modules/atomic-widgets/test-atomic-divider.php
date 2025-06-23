<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Divider\Atomic_Divider;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Divider extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function test__render_divider(): void {
		// Arrange.
		$mock = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Divider::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_divider_with_css_id(): void {
		// Arrange.
		$mock_with_id = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'_cssid' => 'my-custom-divider',
			],
			'widgetType' => Atomic_Divider::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_with_id );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_divider_with_classes(): void {
		// Arrange.
		$mock_with_classes = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'classes' => [ 'custom-class-1', 'custom-class-2' ],
			],
			'widgetType' => Atomic_Divider::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_with_classes );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}
}
