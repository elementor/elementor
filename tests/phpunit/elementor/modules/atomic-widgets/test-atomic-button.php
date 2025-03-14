<?php

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Button extends Elementor_Test_Base {
	use MatchesSnapshots;
	const MOCK = [
		'id' => 'e8e55a1',
		'elType' => 'widget',
		'settings' => [],
		'widgetType' => 'e-button',
	];

	const MOCK_LINK = [
		'id' => 'e8e55a1',
		'elType' => 'widget',
		'settings' => [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_blank',
			],
		],
		'widgetType' => 'e-button',
	];

	const MOCK_LINK_TARGET_SELF = [
		'id' => 'e8e55a1',
		'elType' => 'widget',
		'settings' => [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_self',
			],
		],
		'widgetType' => 'e-button',
	];

	public function test__render_button(): void {
		// Arrange.
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_linked_button(): void {
		// Arrange.
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK_LINK );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_linked_button_target_self(): void {
		// Arrange.
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK_LINK_TARGET_SELF );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}
}
