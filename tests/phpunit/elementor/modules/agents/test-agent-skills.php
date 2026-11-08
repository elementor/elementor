<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Components\Discovery\Well_Known\Agent_Skills;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Agent_Skills extends Elementor_Test_Base {

	private static $abilities_registered = false;

	public function setUp(): void {
		parent::setUp();

		if ( ! function_exists( 'wp_register_ability' ) ) {
			$this->markTestSkipped( 'Abilities API (WP 6.9+) is not available.' );
		}

		if ( ! self::$abilities_registered ) {
			$this->register_test_abilities();
			self::$abilities_registered = true;
		}
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/agents/mcp_server/is_active' );
		parent::tearDown();
	}

	private function register_test_abilities(): void {
		$registry = \WP_Abilities_Registry::get_instance();

		if ( ! $registry ) {
			return;
		}

		if ( $registry->is_registered( 'elementor/test-read-ability' ) ) {
			return;
		}

		$categories_registry = \WP_Ability_Categories_Registry::get_instance();

		if ( $categories_registry && ! $categories_registry->is_registered( 'elementor' ) ) {
			$categories_registry->register( 'elementor', [
				'label' => 'Elementor',
				'description' => 'Elementor abilities',
			] );
		}

		$registry->register( 'elementor/test-read-ability', [
			'label' => 'Test Read Ability',
			'description' => 'A read-only test ability',
			'category' => 'elementor',
			'execute_callback' => static function() { return 'test result'; },
			'permission_callback' => '__return_true',
			'input_schema' => [
				'type' => 'object',
				'properties' => [
					'query' => [ 'type' => 'string' ],
				],
			],
			'meta' => [
				'annotations' => [
					'readonly' => true,
					'destructive' => false,
					'idempotent' => true,
				],
			],
		] );

		$registry->register( 'elementor/test-write-ability', [
			'label' => 'Test Write Ability',
			'description' => 'A write test ability',
			'category' => 'elementor',
			'execute_callback' => static function() { return 'updated'; },
			'permission_callback' => '__return_true',
			'meta' => [
				'annotations' => [
					'readonly' => false,
					'destructive' => true,
					'idempotent' => false,
				],
			],
		] );
	}

	public function test_collect_skills__uses_correct_wp_ability_api_methods() {
		$all_abilities = wp_get_abilities( [ 'category' => 'elementor' ] );
		$this->assertNotEmpty( $all_abilities, 'elementor category should have test abilities registered' );

		$skills_endpoint = new Agent_Skills();
		$reflection = new \ReflectionMethod( Agent_Skills::class, 'collect_skills' );
		$reflection->setAccessible( true );
		$skills = $reflection->invoke( $skills_endpoint );

		$this->assertIsArray( $skills );
		$this->assertNotEmpty( $skills, 'collect_skills should return abilities from the elementor category' );

		$found_read_ability = false;
		$found_write_ability = false;

		foreach ( $skills as $skill ) {
			if ( $skill['id'] === 'elementor/test-read-ability' ) {
				$found_read_ability = true;

				$this->assertSame( 'Test Read Ability', $skill['name'], 'name should come from get_label()' );
				$this->assertSame( 'A read-only test ability', $skill['description'] );
				$this->assertIsArray( $skill['annotations'], 'annotations should come from get_meta_item()' );
				$this->assertTrue( $skill['annotations']['readonly'] );
				$this->assertFalse( $skill['annotations']['destructive'] );
				$this->assertTrue( $skill['annotations']['idempotent'] );
				$this->assertArrayHasKey( 'input_schema', $skill );
				$this->assertSame( 'object', $skill['input_schema']['type'] );
			}

			if ( $skill['id'] === 'elementor/test-write-ability' ) {
				$found_write_ability = true;

				$this->assertSame( 'Test Write Ability', $skill['name'] );
				$this->assertSame( 'A write test ability', $skill['description'] );
				$this->assertIsArray( $skill['annotations'] );
				$this->assertFalse( $skill['annotations']['readonly'] );
				$this->assertTrue( $skill['annotations']['destructive'] );
				$this->assertFalse( $skill['annotations']['idempotent'] );
				$this->assertArrayNotHasKey( 'input_schema', $skill, 'no input_schema when not defined' );
			}
		}

		$this->assertTrue( $found_read_ability, 'test-read-ability should be collected' );
		$this->assertTrue( $found_write_ability, 'test-write-ability should be collected' );
	}
}
