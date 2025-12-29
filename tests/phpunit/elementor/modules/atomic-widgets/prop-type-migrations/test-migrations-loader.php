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
	private string $fixtures_path;

	public function setUp(): void {
		parent::setUp();
		$this->fixtures_path = __DIR__ . '/fixtures/migrations/';
	}

	public function test_find_direct_migration_path() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest.json';

		// Act
		$result = $loader->find_migration_path( 'string', 'string_v2', null, null, $manifest_path );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'up', $result['direction'] );
		$this->assertCount( 1, $result['migrations'] );
		$this->assertEquals( 'string-to-string_v2', $result['migrations'][0]['id'] );
	}

	public function test_find_chained_migration_path() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest.json';

		// Act
		$result = $loader->find_migration_path( 'string', 'html', null, null, $manifest_path );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'up', $result['direction'] );
		$this->assertCount( 2, $result['migrations'] );
		$this->assertEquals( 'string-to-string_v2', $result['migrations'][0]['id'] );
		$this->assertEquals( 'string_v2-to-html', $result['migrations'][1]['id'] );
	}

	public function test_find_reverse_migration_path() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest.json';

		// Act
		$result = $loader->find_migration_path( 'html', 'string', null, null, $manifest_path );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'down', $result['direction'] );
		$this->assertCount( 2, $result['migrations'] );
		$this->assertEquals( 'string_v2-to-html', $result['migrations'][0]['id'] );
		$this->assertEquals( 'string-to-string_v2', $result['migrations'][1]['id'] );
	}

	public function test_find_migration_path_with_widget_filter() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest.json';

		// Act
		$result = $loader->find_migration_path( 'string_v2', 'html', 'e-heading', null, $manifest_path );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'up', $result['direction'] );
		$this->assertCount( 1, $result['migrations'] );
	}

	public function test_find_migration_path_with_prop_filter() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest.json';

		// Act
		$result = $loader->find_migration_path( 'string_v2', 'html', null, 'title', $manifest_path );

		// Assert
		$this->assertNotNull( $result );
		$this->assertEquals( 'up', $result['direction'] );
		$this->assertCount( 1, $result['migrations'] );
	}

	public function test_find_migration_path_no_path_exists() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest.json';

		// Act
		$result = $loader->find_migration_path( 'string', 'nonexistent', null, null, $manifest_path );

		// Assert
		$this->assertNull( $result );
	}

	public function test_load_operations() {
		// Arrange
		$loader = Migrations_Loader::instance();

		// Act
		$operations = $loader->load_operations( 'string-to-string_v2', $this->fixtures_path );

		// Assert
		$this->assertNotNull( $operations );
		$this->assertArrayHasKey( 'up', $operations );
		$this->assertArrayHasKey( 'down', $operations );
		$this->assertIsArray( $operations['up'] );
		$this->assertIsArray( $operations['down'] );
	}

	public function test_load_operations_file_not_found() {
		// Arrange
		$loader = Migrations_Loader::instance();

		// Act
		$operations = $loader->load_operations( 'nonexistent', $this->fixtures_path );

		// Assert
		$this->assertNull( $operations );
	}

	public function test_same_source_and_target_returns_empty_path() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest.json';

		// Act
		$result = $loader->find_migration_path( 'string', 'string', null, null, $manifest_path );

		// Assert
		$this->assertNull( $result );
	}

	public function test_widget_filter_excludes_migration() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest.json';

		// Act - e-button not in widgetType filter
		$result = $loader->find_migration_path( 'string_v2', 'html', 'e-button', null, $manifest_path );

		// Assert
		$this->assertNull( $result );
	}

	public function test_prop_filter_excludes_migration() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest.json';

		// Act - description not in prop filter
		$result = $loader->find_migration_path( 'string_v2', 'html', null, 'description', $manifest_path );

		// Assert
		$this->assertNull( $result );
	}

	public function test_complex_chain_with_multiple_hops() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest-complex.json';

		// Act - a->b->c->d
		$result = $loader->find_migration_path( 'type_a', 'type_d', null, null, $manifest_path );

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
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest-multiple-paths.json';

		// Act - a->b->d vs a->c->e->d (shorter path should win)
		$result = $loader->find_migration_path( 'type_a', 'type_d', null, null, $manifest_path );

		// Assert
		$this->assertNotNull( $result );
		$this->assertCount( 2, $result['migrations'] );
		$this->assertEquals( 'a-to-b', $result['migrations'][0]['id'] );
		$this->assertEquals( 'b-to-d', $result['migrations'][1]['id'] );
	}

	public function test_handles_empty_manifest() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest-empty.json';

		// Act
		$result = $loader->find_migration_path( 'string', 'string_v2', null, null, $manifest_path );

		// Assert
		$this->assertNull( $result );
	}

	public function test_handles_missing_manifest_file() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'nonexistent.json';

		// Act
		$result = $loader->find_migration_path( 'string', 'string_v2', null, null, $manifest_path );

		// Assert
		$this->assertNull( $result );
	}

	public function test_reverse_complex_chain() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest-complex.json';

		// Act - d->c->b->a (reverse)
		$result = $loader->find_migration_path( 'type_d', 'type_a', null, null, $manifest_path );

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
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest-complex.json';

		// Act - type_a->type_c, but b-to-c has widget filter
		$result = $loader->find_migration_path( 'type_a', 'type_c', 'e-test', null, $manifest_path );

		// Assert
		$this->assertNotNull( $result );
		$this->assertCount( 2, $result['migrations'] );
	}

	public function test_no_path_with_incompatible_filters() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest-complex.json';

		// Act - type_a->type_c, but b-to-c requires e-test widget
		$result = $loader->find_migration_path( 'type_a', 'type_c', 'e-other', null, $manifest_path );

		// Assert
		$this->assertNull( $result );
	}

	public function test_disconnected_graph_no_path() {
		// Arrange
		$loader = Migrations_Loader::instance();
		$manifest_path = $this->fixtures_path . 'manifest-disconnected.json';

		// Act - group1 and group2 are not connected
		$result = $loader->find_migration_path( 'group1_a', 'group2_x', null, null, $manifest_path );

		// Assert
		$this->assertNull( $result );
	}
}

