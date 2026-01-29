<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Plugin;
use Elementor\Core\Editor\Data;

class Test_Colors extends Base {
	public function get_command() {
		return 'globals/colors';
	}

	public function get_controller_class() {
		return Data\Globals\Controller::class;
	}

	public function test_create() {
		$id = (string) rand();
		$args = [
			'id' => $id,
			'title' => 'whatever',
			'value' => 'red',
		];

		// Create
		$this->manager->run_endpoint( $this->get_endpoint( $id ), $args, \WP_REST_Server::CREATABLE );

		// Bug: kit does not updated after save.
		$kit = Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );

		$colors = $kit->get_settings( 'custom_colors' );

		$this->assertEquals( $id, $colors[0]['_id'] );
		$this->assertEquals( $args['value'], $colors[0]['color'] );

		return $colors;
	}

	public function test_get() {
		$colors = $this->test_create();

		$rest_result = $this->manager->run_endpoint( $this->get_endpoint( $colors[0]['_id'] ) );

		$this->assertEquals( $rest_result['id'], $colors[0]['_id'] );
	}

	public function test_get_item_that_does_not_exists() {
		$rest_result = $this->manager->run_endpoint( $this->get_endpoint( 'fake_id' ) );

		$this->assertEquals( 'global_not_found', $rest_result['code'] );
		$this->assertEquals( 404, $rest_result['data']['status'] );
	}

	public function test_color_value_sanitization() {
		// Test invalid color values that should be sanitized/rejected
		$test_cases = [
			[
				'input' => '#ff0000',
				'expected' => '#ff0000',
				'description' => 'Valid hex color should pass through'
			],
			[
				'input' => 'ff0000',
				'expected' => null, // sanitize_hex_color returns null for invalid format
				'description' => 'Hex without # should be rejected'
			],
			[
				'input' => '#fff',
				'expected' => '#fff',
				'description' => 'Valid short hex color should pass through'
			],
			[
				'input' => '<script>alert("xss")</script>',
				'expected' => null,
				'description' => 'Malicious script should be rejected'
			],
			[
				'input' => '#gggggg',
				'expected' => null,
				'description' => 'Invalid hex characters should be rejected'
			],
			[
				'input' => '#ff00',
				'expected' => null,
				'description' => 'Invalid hex length should be rejected'
			],
		];
	
		foreach ($test_cases as $test_case) {
			$id = (string) rand();
			$args = [
				'id' => $id,
				'title' => 'Test Color',
				'value' => $test_case['input'],
			];
	
			// Create
			$this->manager->run_endpoint($this->get_endpoint($id), $args, \WP_REST_Server::CREATABLE);
	
			// Get the kit and check the saved value
			$kit = Plugin::$instance->documents->get(Plugin::$instance->kits_manager->get_active_id(), false);
			$colors = $kit->get_settings('custom_colors');
	
			// Find the color we just created
			$created_color = null;
			foreach ($colors as $color) {
				if ($color['_id'] === $id) {
					$created_color = $color;
					break;
				}
			}
	
			$this->assertNotNull($created_color, 'Color should be created: ' . $test_case['description']);
			
			// Check if the color value was properly sanitized
			$actual_value = $created_color['color'] ?? null;
			$this->assertEquals(
				$test_case['expected'], 
				$actual_value, 
				sprintf(
					'%s - Input: "%s", Expected: "%s", Got: "%s"',
					$test_case['description'],
					$test_case['input'],
					$test_case['expected'] ?? 'null',
					$actual_value ?? 'null'
				)
			);
		}
	}
}
