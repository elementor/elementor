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

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		Migrations_Loader::destroy();
	}


	public function tearDown(): void {
		Migrations_Loader::destroy();
		delete_transient( Migrations_Loader::MANIFEST_TRANSIENT_KEY );
		delete_option( Migrations_Loader::MANIFEST_TRANSIENT_KEY . '_stale' );
		remove_all_filters( 'pre_http_request' );
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

	public function test_disconnected_graph_no_path() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_migration_path( 'group1_a', 'group2_x' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_find_widget_key_migration_single_target() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_widget_key_migration( 'svg', [ 'icon' ], 'e-logo' );

		// Assert
		$this->assertEquals( 'icon', $result );
	}

	public function test_find_widget_key_migration_multiple_targets_returns_null() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_widget_key_migration( 'text', [ 'content', 'size' ], 'e-heading' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_find_widget_key_migration_no_path_exists() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_widget_key_migration( 'unknown', [ 'content' ], 'e-heading' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_find_widget_key_migration_different_widget_type() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_widget_key_migration( 'text', [ 'content' ], 'e-button' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_find_widget_key_migration_bidirectional_path() {
		// Arrange
		$loader = Migrations_Loader::make( $this->fixtures_path );

		// Act
		$result = $loader->find_widget_key_migration( 'icon', [ 'svg' ], 'e-logo' );

		// Assert
		$this->assertEquals( 'svg', $result );
	}

	public function test_remote_manifest_returns_cached_transient() {
		// Arrange
		$manifest_json = wp_json_encode( [ 'propTypes' => [], 'widgetKeys' => [] ] );
		set_transient( Migrations_Loader::MANIFEST_TRANSIENT_KEY, $manifest_json, HOUR_IN_SECONDS );

		$loader = Migrations_Loader::make( 'https://migrations.elementor.com/' );

		// Act
		$hash = $loader->get_manifest_hash();

		// Assert
		$this->assertNotEmpty( $hash );
	}

	public function test_remote_manifest_fetches_and_caches_on_transient_miss() {
		// Arrange
		$manifest = [ 'propTypes' => [], 'widgetKeys' => [] ];
		$manifest_json = wp_json_encode( $manifest );

		delete_transient( Migrations_Loader::MANIFEST_TRANSIENT_KEY );
		delete_option( Migrations_Loader::MANIFEST_TRANSIENT_KEY . '_stale' );

		add_filter( 'pre_http_request', function ( $pre, $args, $url ) use ( $manifest_json ) {
			if ( false !== strpos( $url, 'migrations.elementor.com' ) ) {
				return [ 'response' => [ 'code' => 200 ], 'body' => $manifest_json ];
			}
			return $pre;
		}, 10, 3 );

		$loader = Migrations_Loader::make( 'https://migrations.elementor.com/' );

		// Act
		$hash = $loader->get_manifest_hash();

		// Assert
		$this->assertNotEmpty( $hash );
		$this->assertEquals( $manifest_json, get_transient( Migrations_Loader::MANIFEST_TRANSIENT_KEY ) );
		$this->assertEquals( $manifest_json, get_option( Migrations_Loader::MANIFEST_TRANSIENT_KEY . '_stale' ) );
	}

	public function test_remote_manifest_falls_back_to_stale_on_fetch_failure() {
		// Arrange
		$stale_manifest = wp_json_encode( [ 'propTypes' => [], 'widgetKeys' => [] ] );

		delete_transient( Migrations_Loader::MANIFEST_TRANSIENT_KEY );
		update_option( Migrations_Loader::MANIFEST_TRANSIENT_KEY . '_stale', $stale_manifest, false );

		add_filter( 'pre_http_request', function ( $pre, $args, $url ) {
			if ( false !== strpos( $url, 'migrations.elementor.com' ) ) {
				return new \WP_Error( 'http_request_failed', 'Connection timed out' );
			}
			return $pre;
		}, 10, 3 );

		$loader = Migrations_Loader::make( 'https://migrations.elementor.com/' );

		// Act
		$hash = $loader->get_manifest_hash();

		// Assert
		$this->assertNotEmpty( $hash );
		$this->assertEquals( md5( $stale_manifest ), $hash );
	}

	public function test_remote_manifest_returns_empty_when_no_cache_and_fetch_fails() {
		// Arrange
		delete_transient( Migrations_Loader::MANIFEST_TRANSIENT_KEY );
		delete_option( Migrations_Loader::MANIFEST_TRANSIENT_KEY . '_stale' );

		add_filter( 'pre_http_request', function ( $pre, $args, $url ) {
			if ( false !== strpos( $url, 'migrations.elementor.com' ) ) {
				return new \WP_Error( 'http_request_failed', 'Connection timed out' );
			}
			return $pre;
		}, 10, 3 );

		$loader = Migrations_Loader::make( 'https://migrations.elementor.com/' );

		// Act
		$hash = $loader->get_manifest_hash();

		// Assert
		$this->assertEmpty( $hash );
	}
}

