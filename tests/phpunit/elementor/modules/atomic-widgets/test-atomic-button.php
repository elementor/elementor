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

	/**
	 * Data provider for link sanitization tests.
	 *
	 * @return array Test cases with input URL and expected sanitized output.
	 */
	public function link_sanitization_data_provider(): array {
		return [
			'url_with_query_params' => [
				'input' => 'https://stackabuse.com/search/?type=article&q=Python',
				'expected' => 'https://stackabuse.com/search/?type=article&amp;q=Python',
			],
			'anchor_link' => [
				'input' => 'https://example.com/page#section-1',
				'expected' => 'https://example.com/page#section-1',
			],
			'complex_url_with_multiple_params_and_anchor' => [
				'input' => 'https://example.com/search?q=test&category=php&sort=date&order=desc#results',
				'expected' => 'https://example.com/search?q=test&amp;category=php&amp;sort=date&amp;order=desc#results',
			],
			'url_with_special_characters' => [
				'input' => 'https://example.com/search?q=hello%20world&filter=a+b&special=%21%40%23',
				'expected' => 'https://example.com/search?q=hello%20world&amp;filter=a+b&amp;special=%21%40%23',
			],
			'already_sanitized_url_no_double_encoding' => [
				'input' => 'https://example.com/search?q=test&amp;category=php',
				'expected' => 'https://example.com/search?q=test&amp;category=php',
			],
			'url_with_html_entities_no_double_encoding' => [
				'input' => 'https://example.com/search?q=test&#038;category=php',
				'expected' => 'https://example.com/search?q=test&#038;category=php',
			],
			'unsafe_javascript_url' => [
				'input' => 'javascript:alert("xss")',
				'expected' => '',
			],
			'malformed_url' => [
				'input' => 'not-a-valid-url',
				'expected' => '',
			],
			'url_with_spaces' => [
				'input' => 'https://example.com/search?q=hello world',
				'expected' => 'https://example.com/search?q=hello%20world',
			],
		];
	}

	/**
	 * Test that link sanitization produces the expected output without double-encoding.
	 *
	 * @dataProvider link_sanitization_data_provider
	 */
	public function test__link_sanitization_applied( string $input, string $expected ): void {
		// Arrange.
		$mock_link = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'link' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [
							'$$type' => 'url',
							'value' => $input,
						],
						'isTargetBlank' => [
							'$$type' => 'boolean',
							'value' => false,
						],
					],
				],
			],
			'widgetType' => Atomic_Button::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert
		$this->assertStringContainsString( 
			$expected, 
			$rendered_output, 
			"Original URL '{$url}' not found in output" 
		);
	}
}
