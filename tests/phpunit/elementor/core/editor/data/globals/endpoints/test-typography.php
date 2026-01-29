<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Plugin;
use Elementor\Core\Editor\Data;

class Test_Typography extends Base {
	public function get_command() {
		return 'globals/typography';
	}

	public function get_controller_class() {
		return Data\Globals\Controller::class;
	}

	public function test_create() {
		$id = (string) rand();
		$args = [
			'id' => $id,
			'title' => 'whatever',
			'value' => [
				'whatever' => true,
			],
		];

		// Create
		$result = $this->manager->run_endpoint( $this->get_endpoint( $id ), $args, \WP_REST_Server::CREATABLE );

		// Bug: kit does not updated after save.
		$kit = Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );

		$typography = $kit->get_settings( 'custom_typography' );

		$this->assertEquals( $id, $typography[0]['_id'] );
		$this->assert_array_have_keys( [ 'whatever' ], $typography[0] );

		return $typography;
	}

	public function test_get() {
		$typography = $this->test_create();

		$rest_result = $this->manager->run_endpoint( $this->get_endpoint( $typography[0]['_id'] ) );

		$this->assertEquals( $rest_result['id'], $typography[0]['_id'] );
	}

	public function test_get_item_that_does_not_exists() {
		$rest_result = $this->manager->run_endpoint( $this->get_endpoint( 'fake_id' ) );

		$this->assertEquals( 'global_not_found', $rest_result['code'] );
		$this->assertEquals( 404, $rest_result['data']['status'] );
	}

	public function test_typography_value_sanitization() {
		$test_cases = [
			[
				'title' => 'Valid Title',
				'value' => [
					'font_family' => 'Arial',
					'font_size' => '16px',
					'line_height' => '1.5',
				],
				'expected_title' => 'Valid Title',
				'expected_values' => [
					'font_family' => 'Arial',
					'font_size' => '16px',
					'line_height' => '1.5',
				],
				'description' => 'Valid typography values should pass through',
			],
			[
				'title' => '<script>alert("xss")</script>',
				'value' => [
					'font_family' => '<script>alert("xss")</script>',
				],
				'expected_title' => 'alert("xss")',
				'expected_values' => [
					'font_family' => 'alert("xss")',
				],
				'description' => 'Malicious script tags should be stripped',
			],
			[
				'title' => "Title with\nnewlines\rand\ttabs",
				'value' => [
					'font_family' => "Font with\nnewlines",
				],
				'expected_title' => 'Title with newlines and tabs',
				'expected_values' => [
					'font_family' => 'Font with newlines',
				],
				'description' => 'Newlines and tabs should be sanitized',
			],
			[
				'title' => 'Mixed Values',
				'value' => [
					'font_family' => '<b>Bold Font</b>',
					'font_weight' => 700,
					'is_custom' => true,
				],
				'expected_title' => 'Mixed Values',
				'expected_values' => [
					'font_family' => 'Bold Font',
					'font_weight' => 700,
					'is_custom' => true,
				],
				'description' => 'HTML should be stripped from strings, non-strings preserved',
			],
		];

		foreach ( $test_cases as $test_case ) {
			$id = (string) rand();
			$args = [
				'id' => $id,
				'title' => $test_case['title'],
				'value' => $test_case['value'],
			];

			$this->manager->run_endpoint( $this->get_endpoint( $id ), $args, \WP_REST_Server::CREATABLE );

			$kit = Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );
			$typography = $kit->get_settings( 'custom_typography' );

			$created_typography = null;
			foreach ( $typography as $typo ) {
				if ( $typo['_id'] === $id ) {
					$created_typography = $typo;
					break;
				}
			}

			$this->assertNotNull( $created_typography, 'Typography should be created: ' . $test_case['description'] );

			$this->assertEquals(
				$test_case['expected_title'],
				$created_typography['title'],
				sprintf(
					'%s - Title sanitization failed. Expected: "%s", Got: "%s"',
					$test_case['description'],
					$test_case['expected_title'],
					$created_typography['title']
				)
			);

			foreach ( $test_case['expected_values'] as $key => $expected_value ) {
				$this->assertEquals(
					$expected_value,
					$created_typography[ $key ],
					sprintf(
						'%s - Value "%s" sanitization failed. Expected: "%s", Got: "%s"',
						$test_case['description'],
						$key,
						is_scalar( $expected_value ) ? $expected_value : gettype( $expected_value ),
						is_scalar( $created_typography[ $key ] ) ? $created_typography[ $key ] : gettype( $created_typography[ $key ] )
					)
				);
			}
		}
	}
}
