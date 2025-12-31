<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mock_String_V2_Prop_Type extends String_Prop_Type {
	public static function get_key(): string {
		return 'string_v2';
	}
}

/**
 * @group prop-type-migrations
 */
class Test_Migrations_Orchestrator extends Elementor_Test_Base {
	private string $fixtures_path = __DIR__ . '/fixtures/orchestrator/migrations/';

	public function tearDown(): void {
		Migrations_Orchestrator::destroy();
		parent::tearDown();
	}

	public function test_no_migration_needed_validation_passes() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'title' => [
				'$$type' => 'string',
				'value' => 'Hello World',
			],
			'count' => [
				'$$type' => 'number',
				'value' => 42,
			],
		];

		$schema = [
			'title' => String_Prop_Type::make(),
			'count' => Number_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate( $settings, $schema, 'e-heading' );

		// Assert
		$this->assertEquals( $settings, $result );
	}

	public function test_migration_needed_but_no_path_exists() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'title' => [
				'$$type' => 'nonexistent_type',
				'value' => 'Hello World',
			],
		];

		$schema = [
			'title' => String_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate( $settings, $schema, 'e-heading' );

		// Assert
		$this->assertEquals( $settings, $result );
	}

	public function test_single_prop_migration_direct_path() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'title' => [
				'$$type' => 'string',
				'value' => 'Hello World',
			],
			'count' => [
				'$$type' => 'number',
				'value' => 42,
			],
		];

		$schema = [
			'title' => Mock_String_V2_Prop_Type::make(),
			'count' => Number_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate( $settings, $schema, 'e-heading' );

		// Assert
		$this->assertEquals( 'string_v2', $result['title']['$$type'] );
		$this->assertEquals( 'Hello World', $result['title']['value'] );
		$this->assertEquals( $settings['count'], $result['count'] );
	}

	public function test_widget_level_migration_direct_path() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'title' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
			'subtitle' => [
				'$$type' => 'string',
				'value' => 'World',
			],
		];

		$schema = [
			'title' => Html_Prop_Type::make(),
			'subtitle' => String_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate( $settings, $schema, 'e-heading' );

		// Assert
		$this->assertEquals( 'html', $result['title']['$$type'] );
		$this->assertEquals( 'Hello', $result['title']['value'] );
		$this->assertEquals( $settings['subtitle'], $result['subtitle'] );
	}

	public function test_single_prop_migration_chained_path() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'description' => [
				'$$type' => 'string',
				'value' => 'test',
			],
		];

		$schema = [
			'description' => Html_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate( $settings, $schema, 'e-paragraph' );

		// Assert
		$this->assertEquals( 'html', $result['description']['$$type'] );
		$this->assertEquals( 'test', $result['description']['value'] );
	}

	public function test_multiple_props_migration() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'title' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
			'count' => [
				'$$type' => 'number',
				'value' => 42,
			],
			'unchanged' => [
				'$$type' => 'string',
				'value' => 'Static',
			],
		];

		$schema = [
			'title' => Mock_String_V2_Prop_Type::make(),
			'count' => String_Prop_Type::make(),
			'unchanged' => String_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate( $settings, $schema, 'e-widget' );

		// Assert
		$this->assertEquals( 'string_v2', $result['title']['$$type'] );
		$this->assertEquals( 'Hello', $result['title']['value'] );
		$this->assertEquals( 'string', $result['count']['$$type'] );
		$this->assertEquals( 42, $result['count']['value'] );
		$this->assertEquals( $settings['unchanged'], $result['unchanged'] );
	}
}

