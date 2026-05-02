<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Paragraph extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function test__render_paragraph(): void {
		// Arrange.
		$mock = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_linked_paragraph(): void {
		// Arrange.
		$mock_link = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'link' => [
					'href' => 'https://example.com',
					'target' => '_blank',
					'tag' => 'a',
				],
			],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_linked_paragraph_target_self(): void {
		// Arrange.
		$mock_link_target_self = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'link' => [
					'href' => 'https://example.com',
					'target' => '_self',
					'tag' => 'a',
				],
			],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link_target_self );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_paragraph_with_action_link(): void {
		// Arrange.
		$mock_link = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'link' => [
					'href' => 'https://very.dynamic.content.elementor',
					'target' => '_blank',
					'tag' => 'button',
				],
			],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
		$this->assertStringContainsString( 'data-action-link="https://very.dynamic.content.elementor"', $rendered_output );
		$this->assertStringContainsString( '<button', $rendered_output );
		$this->assertStringNotContainsString( '<a', $rendered_output );
		$this->assertStringNotContainsString( 'href="', $rendered_output );
	}
}
