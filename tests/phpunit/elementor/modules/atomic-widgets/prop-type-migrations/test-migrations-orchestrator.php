<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

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
	use MatchesSnapshots;

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
		$result = $orchestrator->migrate_element( $settings, $schema, 'e-heading' );

		// Assert
		$this->assertFalse( $result['has_changes'], 'No changes expected when validation passes' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
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
		$result = $orchestrator->migrate_element( $settings, $schema, 'e-heading' );

		// Assert
		$this->assertFalse( $result['has_changes'], 'No changes when migration path does not exist' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
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
		$result = $orchestrator->migrate_element( $settings, $schema, 'e-heading' );

		// Assert
		$this->assertTrue( $result['has_changes'], 'Changes expected when prop type migration occurs' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
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
		$result = $orchestrator->migrate_element( $settings, $schema, 'e-heading' );

		// Assert
		$this->assertTrue( $result['has_changes'], 'Changes expected for widget-level migration' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
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
		$result = $orchestrator->migrate_element( $settings, $schema, 'e-paragraph' );

		// Assert
		$this->assertTrue( $result['has_changes'], 'Changes expected for chained migration' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
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
		$result = $orchestrator->migrate_element( $settings, $schema, 'e-widget' );

		// Assert
		$this->assertTrue( $result['has_changes'], 'Changes expected when multiple props migrate' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
	}

	public function test_widget_key_migration_upgrade() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
		];

		$schema = [
			'content' => String_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate_element( $settings, $schema, 'test-widget-key-upgrade' );

		// Assert
		$this->assertTrue( $result['has_changes'], 'Changes expected for widget key migration' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
	}

	public function test_widget_key_migration_downgrade() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'icon' => [
				'$$type' => 'string',
				'value' => 'logo.svg',
			],
		];

		$schema = [
			'svg' => String_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate_element( $settings, $schema, 'test-widget-key-downgrade' );

		// Assert
		$this->assertTrue( $result['has_changes'], 'Changes expected for widget key downgrade' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
	}

	public function test_widget_key_and_prop_type_migration() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
		];

		$schema = [
			'content' => Mock_String_V2_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate_element( $settings, $schema, 'test-widget-key-and-type' );

		// Assert
		$this->assertTrue( $result['has_changes'], 'Changes expected for key and type migration' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
	}

	public function test_no_widget_key_migration_when_no_path_exists() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'unknown' => [
				'$$type' => 'string',
				'value' => 'value',
			],
		];

		$schema = [
			'content' => String_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate_element( $settings, $schema, 'test-no-migration-path' );

		// Assert
		$this->assertFalse( $result['has_changes'], 'No changes when no migration path exists' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
	}

	public function test_multiple_orphaned_keys_to_one_missing_key_skips_migration() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
			'oldSize' => [
				'$$type' => 'string',
				'value' => 'large',
			],
		];

		$schema = [
			'content' => String_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate_element( $settings, $schema, 'test-multiple-to-one' );

		// Assert
		$this->assertFalse( $result['has_changes'], 'No changes when multiple orphaned keys target one' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
	}

	public function test_one_orphaned_key_with_multiple_targets_skips_migration() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
		];

		$schema = [
			'content' => String_Prop_Type::make(),
			'size' => String_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate_element( $settings, $schema, 'test-one-to-multiple' );

		// Assert
		$this->assertFalse( $result['has_changes'], 'No changes when one orphaned key has multiple targets' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
	}

	public function test_multiple_unambiguous_widget_key_migrations() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
			'oldSize' => [
				'$$type' => 'string',
				'value' => 'large',
			],
		];

		$schema = [
			'content' => String_Prop_Type::make(),
			'size' => String_Prop_Type::make(),
		];

		// Act
		$result = $orchestrator->migrate_element( $settings, $schema, 'test-unambiguous-multiple' );

		// Assert
		$this->assertTrue( $result['has_changes'], 'Changes expected for multiple unambiguous migrations' );
		$this->assertMatchesJsonSnapshot( $result['settings'] );
	}
}

