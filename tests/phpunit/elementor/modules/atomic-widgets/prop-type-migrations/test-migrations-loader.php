<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Loader;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Migrations_Loader extends Elementor_Test_Base {
	private string $fixtures_path = __DIR__ . '/fixtures/migrations/';


	public function tearDown(): void {
		Migrations_Loader::destroy();
		parent::tearDown();
	}

	public function test_find_direct_migration_path() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );
		// Act
		$result = $loader->find_migration_path( 'string', 'string_v2' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'up', $result['direction'] );
		$this->assertCount( 1, $result['migrations'] );
		$this->assertEquals( 'string-to-string_v2', $result['migrations'][0]['id'] );
	}

	public function test_find_chained_migration_path() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );
		// Act
		$result = $loader->find_migration_path( 'string', 'html' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'up', $result['direction'] );
		$this->assertCount( 2, $result['migrations'] );
		$this->assertEquals( 'string-to-string_v2', $result['migrations'][0]['id'] );
		$this->assertEquals( 'string_v2-to-html', $result['migrations'][1]['id'] );
	}

	public function test_find_reverse_migration_path() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );
		// Act
		$result = $loader->find_migration_path( 'html', 'string' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'down', $result['direction'] );
		$this->assertCount( 2, $result['migrations'] );
		$this->assertEquals( 'string_v2-to-html', $result['migrations'][0]['id'] );
		$this->assertEquals( 'string-to-string_v2', $result['migrations'][1]['id'] );
	}

	public function test_find_migration_path_with_widget_filter() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );
		// Act
		$result = $loader->find_migration_path( 'string_v2', 'html', 'e-heading' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'up', $result['direction'] );
		$this->assertCount( 1, $result['migrations'] );
	}

	public function test_find_migration_path_with_prop_filter() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );
		// Act
		$result = $loader->find_migration_path( 'string_v2', 'html', null, 'title' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'up', $result['direction'] );
		$this->assertCount( 1, $result['migrations'] );
	}

	public function test_find_migration_path_no_path_exists() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'string', 'nonexistent' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_load_operations() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$operations = $loader->load_operations( 'string-to-string_v2' );

		// Assert
		$this->assertNotNull( $operations );
		$this->assertArrayHasKey( 'up', $operations );
		$this->assertArrayHasKey( 'down', $operations );
		$this->assertIsArray( $operations['up'] );
		$this->assertIsArray( $operations['down'] );
	}

	public function test_load_operations_file_not_found() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$operations = $loader->load_operations( 'nonexistent' );

		// Assert
		$this->assertNull( $operations );
	}

	public function test_same_source_and_target_returns_empty_path() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'string', 'string' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_widget_filter_excludes_migration() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'string_v2', 'html', 'e-button' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_prop_filter_excludes_migration() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'string_v2', 'html', null, 'description' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_complex_chain_with_multiple_hops() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'type_a', 'type_d' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'up', $result['direction'] );
		$this->assertCount( 3, $result['migrations'] );
		$this->assertEquals( 'a-to-b', $result['migrations'][0]['id'] );
		$this->assertEquals( 'b-to-c', $result['migrations'][1]['id'] );
		$this->assertEquals( 'c-to-d', $result['migrations'][2]['id'] );
	}

	public function test_finds_shortest_path_when_multiple_routes_exist() {
		// Arrange
		Migrations_Loader::destroy();
		$loader = Migrations_Loader::make( $this->fixtures_path, 'manifest-multiple-paths.json' );

		// Act
		$result = $loader->find_migration_path( 'type_a', 'type_d' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertCount( 2, $result['migrations'] );
		$this->assertEquals( 'a-to-b', $result['migrations'][0]['id'] );
		$this->assertEquals( 'b-to-d', $result['migrations'][1]['id'] );
	}

	public function test_handles_empty_manifest() {
		// Arrange
		Migrations_Loader::destroy();
		$loader = Migrations_Loader::make( $this->fixtures_path, 'manifest-empty.json' );

		// Act
		$result = $loader->find_migration_path( 'string', 'string_v2' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_handles_missing_manifest_file() {
		// Arrange
		Migrations_Loader::destroy();
		$loader = Migrations_Loader::make( $this->fixtures_path, 'nonexistent.json' );

		// Act
		$result = $loader->find_migration_path( 'string', 'string_v2' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_reverse_complex_chain() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'type_d', 'type_a' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'down', $result['direction'] );
		$this->assertCount( 3, $result['migrations'] );
		$this->assertEquals( 'c-to-d', $result['migrations'][0]['id'] );
		$this->assertEquals( 'b-to-c', $result['migrations'][1]['id'] );
		$this->assertEquals( 'a-to-b', $result['migrations'][2]['id'] );
	}

	public function test_partial_chain_with_widget_filter() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'type_a', 'type_c', 'e-test' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertCount( 2, $result['migrations'] );
	}

	public function test_no_path_with_incompatible_filters() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'type_a', 'type_c', 'e-other' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_disconnected_graph_no_path() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'group1_a', 'group2_x' );

		// Assert
		$this->assertNull( $result );
	}
}

