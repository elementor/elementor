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
		$test_cases = [
			[
				'input' => '#ff0000',
				'expected' => '#ff0000',
				'description' => 'Valid hex color should pass through unchanged'
			],
			[
				'input' => 'rgb(255, 0, 0)',
				'expected' => 'rgb(255, 0, 0)',
				'description' => 'RGB color format should pass through'
			],
			[
				'input' => '<script>alert("xss")</script>',
				'expected' => 'alert("xss")',
				'description' => 'Malicious script tags should be stripped'
			],
			[
				'input' => '<b>red</b>',
				'expected' => 'red',
				'description' => 'HTML tags should be stripped'
			],
			[
				'input' => "color with\nnewlines\rand\ttabs",
				'expected' => 'color with newlines and tabs',
				'description' => 'Newlines and tabs should be sanitized'
			],
			[
				'input' => '#gggggg',
				'expected' => '#gggggg',
				'description' => 'Invalid hex colors are not validated, pass through as text'
			],
			[
				'input' => '  #ffffff  ',
				'expected' => '#ffffff',
				'description' => 'Leading and trailing whitespace should be trimmed'
			],
		];
	
		foreach ( $test_cases as $test_case ) {
			$id = (string) rand();
			$args = [
				'id' => $id,
				'title' => 'Test Color',
				'value' => $test_case['input'],
			];
	
			$this->manager->run_endpoint( $this->get_endpoint( $id ), $args, \WP_REST_Server::CREATABLE );
	
			$kit = Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );
			$colors = $kit->get_settings( 'custom_colors' );
	
			$created_color = null;
			foreach ( $colors as $color ) {
				if ( $color['_id'] === $id ) {
					$created_color = $color;
					break;
				}
			}
	
			$this->assertNotNull( $created_color, 'Color should be created: ' . $test_case['description'] );
			
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
