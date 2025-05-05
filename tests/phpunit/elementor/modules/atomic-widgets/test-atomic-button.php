<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Button extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function test__render_button(): void {
		// Arrange.
		$mock = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Button::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_linked_button(): void {
		// Arrange.
		$mock_link = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'link' => [
					'href' => 'https://example.com',
					'target' => '_blank',
				],
			],
			'widgetType' => Atomic_Button::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_linked_button_target_self(): void {
		// Arrange.
		$mock_link_target_self = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'link' => [
					'href' => 'https://example.com',
					'target' => '_self',
				],
			],
			'widgetType' => Atomic_Button::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link_target_self );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}
}
