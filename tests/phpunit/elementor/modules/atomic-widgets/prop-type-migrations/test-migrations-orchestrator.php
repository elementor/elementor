<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Cache;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Loader;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Migrations_Orchestrator extends Elementor_Test_Base {
	private ?string $original_elementor_version = null;

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		Migrations_Orchestrator::destroy();
	}

	public function setUp(): void {
		parent::setUp();

		$this->original_elementor_version = get_option( 'elementor_version' );
		update_option( 'elementor_version', ELEMENTOR_VERSION );
		Migrations_Orchestrator::clear_migration_cache();
		Migrations_Orchestrator::destroy();
	}

	public function tearDown(): void {
		update_option( 'elementor_version', $this->original_elementor_version );
		Migrations_Orchestrator::destroy();
		parent::tearDown();
	}

	public function test_is_rollback_returns_false_when_versions_match() {
		// Arrange
		update_option( 'elementor_version', ELEMENTOR_VERSION );

		// Act
		$result = Migrations_Orchestrator::is_rollback();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_is_rollback_returns_true_when_running_version_is_lower() {
		// Arrange
		update_option( 'elementor_version', '99.0.0' );

		// Act
		$result = Migrations_Orchestrator::is_rollback();

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_rollback_returns_false_when_running_version_is_higher() {
		// Arrange
		update_option( 'elementor_version', '0.0.1' );

		// Act
		$result = Migrations_Orchestrator::is_rollback();

		// Assert
		$this->assertFalse( $result );
	}

	public function test_migrate_uses_local_manifest_during_version_upgrade() {
		// Arrange
		update_option( 'elementor_version', '0.0.1' );
		$fetch_count = 0;

		add_filter( 'pre_http_request', function () use ( &$fetch_count ) {
			$fetch_count++;
			return new \WP_Error( 'should_not_be_called', 'Remote should not be called during upgrade' );
		} );

		$orchestrator = Migrations_Orchestrator::make();
		$data = $this->get_sample_data();
		$post_id = 5004;

		// Act
		$orchestrator->migrate(
			$data,
			$post_id,
			'_elementor_data',
			function () {}
		);

		// Assert
		$this->assertEquals( 0, $fetch_count );
	}

	public function test_migrate_uses_local_manifest_without_remote_fetch() {
		// Arrange
		update_option( 'elementor_version', ELEMENTOR_VERSION );
		$fetch_count = 0;

		add_filter( 'pre_http_request', function () use ( &$fetch_count ) {
			$fetch_count++;
			return new \WP_Error( 'should_not_be_called', 'Remote should not be called' );
		} );

		$orchestrator = Migrations_Orchestrator::make();
		$data = $this->get_sample_data();
		$post_id = 5001;

		// Act
		$orchestrator->migrate(
			$data,
			$post_id,
			'_elementor_data',
			function () {}
		);

		// Assert
		$this->assertEquals( 0, $fetch_count );
	}

	public function test_migrate_uses_remote_manifest_on_rollback() {
		// Arrange
		update_option( 'elementor_version', '99.0.0' );
		$manifest = json_decode( file_get_contents( ELEMENTOR_PATH . 'migrations/manifest.json' ), true );
		$fetch_count = 0;

		add_filter( 'pre_http_request', function () use ( $manifest, &$fetch_count ) {
			$fetch_count++;
			return [
				'headers' => [],
				'response' => [ 'code' => 200, 'message' => 'OK' ],
				'body' => wp_json_encode( $manifest ),
			];
		} );

		$orchestrator = Migrations_Orchestrator::make();
		$data = $this->get_sample_data();
		$post_id = 5002;

		// Act
		$orchestrator->migrate(
			$data,
			$post_id,
			'_elementor_data',
			function () {}
		);

		// Assert
		$this->assertGreaterThanOrEqual( 1, $fetch_count );
	}

	public function test_migrate_falls_back_to_local_manifest_when_remote_fetch_fails_on_rollback() {
		// Arrange
		update_option( 'elementor_version', '99.0.0' );
		$manifest_fetch_count = 0;

		add_filter( 'pre_http_request', function ( $pre, $args, $url ) use ( &$manifest_fetch_count ) {
			if ( 'manifest.json' !== basename( $url ) ) {
				return $pre;
			}

			$manifest_fetch_count++;
			return new \WP_Error( 'http_request_failed', 'Connection timed out' );
		}, 10, 3 );

		$orchestrator = Migrations_Orchestrator::make();
		$data = $this->get_sample_data();
		$post_id = 5003;

		// Act
		$orchestrator->migrate(
			$data,
			$post_id,
			'_elementor_data',
			function () {}
		);

		// Assert
		$this->assertGreaterThanOrEqual( 1, $manifest_fetch_count );
		$this->assertFalse( get_transient( 'elementor_migrations_manifest' ) );

		$loader = $this->get_orchestrator_loader( $orchestrator );
		$this->assertNotNull( $loader->find_migration_path( 'string', 'html' ) );
	}

	public function test_migrate__does_not_mark_as_migrated_when_save_callback_returns_false() {
		// Arrange - legacy string-to-html payload that requires a migration walk to produce changes.
		$orchestrator = Migrations_Orchestrator::make();
		$post_id = 6001;
		$data = $this->get_migrateable_data();

		// Act
		$orchestrator->migrate(
			$data,
			$post_id,
			'_elementor_data',
			fn () => false
		);

		// Assert - cache must NOT be marked as migrated, so subsequent loads retry the migration.
		$loader = $this->get_orchestrator_loader( $orchestrator );
		$this->assertFalse( Migrations_Cache::is_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() ) );
	}

	public function test_migrate__does_not_mark_as_migrated_when_save_callback_throws() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make();
		$post_id = 6002;
		$data = $this->get_migrateable_data();

		// Act
		$orchestrator->migrate(
			$data,
			$post_id,
			'_elementor_data',
			function () {
				throw new \RuntimeException( 'simulated write failure' );
			}
		);

		// Assert
		$loader = $this->get_orchestrator_loader( $orchestrator );
		$this->assertFalse( Migrations_Cache::is_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() ) );
	}

	public function test_migrate__marks_as_migrated_when_save_callback_returns_true_or_null() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make();

		foreach ( [ 6003 => fn () => true, 6004 => function () { /* returns null */ } ] as $post_id => $callback ) {
			$data = $this->get_migrateable_data();

			// Act
			$orchestrator->migrate( $data, $post_id, '_elementor_data', $callback );

			// Assert
			$loader = $this->get_orchestrator_loader( $orchestrator );
			$this->assertTrue(
				Migrations_Cache::is_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() ),
				"Expected post $post_id to be marked migrated"
			);
		}
	}

	public function test_migrate__trusts_cache_and_skips_walk_when_marked_migrated() {
		// Arrange - bootstrap the orchestrator (populates its loader) with a throwaway call,
		// then mark the entity as migrated so the next migrate() call must short-circuit before
		// touching the data.
		$orchestrator = Migrations_Orchestrator::make();
		$bootstrap = [];
		$orchestrator->migrate( $bootstrap, 6099, '_bootstrap_loader', fn () => true );

		$loader = $this->get_orchestrator_loader( $orchestrator );
		$post_id = 6005;

		Migrations_Cache::mark_as_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() );

		$data = $this->get_migrateable_data();
		$save_called = false;

		// Act
		$orchestrator->migrate(
			$data,
			$post_id,
			'_elementor_data',
			function () use ( &$save_called ) {
				$save_called = true;
				return true;
			}
		);

		// Assert - cache hit short-circuits: the walk should be skipped and the data returned
		// unchanged. Cache invalidation is a separate concern handled by
		// `maybe_invalidate_entity_cache`.
		$this->assertFalse( $save_called, 'save_callback must not run on a cache hit.' );
		$this->assertSame( 'string', $data[0]['settings']['title']['$$type'] ?? null );
	}

	public function test_maybe_invalidate_entity_cache__clears_cache_on_elementor_data_write() {
		// Arrange - warm the cache for a specific entity so we can observe the invalidation.
		$orchestrator = Migrations_Orchestrator::make();
		$bootstrap = [];
		$orchestrator->migrate( $bootstrap, 6099, '_bootstrap_loader', fn () => true );
		$loader = $this->get_orchestrator_loader( $orchestrator );
		$post_id = 6010;

		Migrations_Cache::mark_as_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() );
		$this->assertTrue(
			Migrations_Cache::is_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() ),
			'Precondition: cache should start out marked.'
		);

		// Act - simulate an external write to _elementor_data. This is what any client save,
		// import, WP-CLI mutation, or third-party plugin ultimately does.
		Migrations_Orchestrator::maybe_invalidate_entity_cache( 0, $post_id, '_elementor_data', 'irrelevant' );

		// Assert - cache is cleared so the next load walks the (potentially legacy) payload.
		$this->assertFalse(
			Migrations_Cache::is_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() ),
			'External writes to _elementor_data must invalidate the migration cache.'
		);
	}

	public function test_maybe_invalidate_entity_cache__leaves_cache_untouched_for_other_meta_keys() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make();
		$bootstrap = [];
		$orchestrator->migrate( $bootstrap, 6099, '_bootstrap_loader', fn () => true );
		$loader = $this->get_orchestrator_loader( $orchestrator );
		$post_id = 6011;

		Migrations_Cache::mark_as_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() );

		// Act - a write to some unrelated meta key must not clear the migration cache.
		Migrations_Orchestrator::maybe_invalidate_entity_cache( 0, $post_id, '_edit_lock', 'irrelevant' );

		// Assert
		$this->assertTrue( Migrations_Cache::is_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() ) );
	}

	public function test_update_post_meta_on_elementor_data_invalidates_the_cache_end_to_end() {
		// Arrange - wire the hook (production does this from the module bootstrap) and warm the
		// cache for a real WP post so update_post_meta triggers the WP action pipeline.
		$orchestrator = Migrations_Orchestrator::make();
		$orchestrator->register_hooks();

		$bootstrap = [];
		$orchestrator->migrate( $bootstrap, 6099, '_bootstrap_loader', fn () => true );

		$post_id = wp_insert_post( [
			'post_title'   => 'Cache invalidation E2E',
			'post_status'  => 'draft',
			'post_type'    => 'post',
		] );
		$this->assertIsInt( $post_id );

		$loader = $this->get_orchestrator_loader( $orchestrator );
		Migrations_Cache::mark_as_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() );

		// Act - simulate any external actor (client save, import, WP-CLI, third-party plugin)
		// writing to the migrated meta key.
		update_post_meta( $post_id, '_elementor_data', wp_slash( wp_json_encode( [ 'placeholder' => true ] ) ) );

		// Assert - the cache is cleared so the next editor load re-runs the migration walk.
		$this->assertFalse( Migrations_Cache::is_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() ) );

		// Cleanup
		wp_delete_post( $post_id, true );
	}

	public function test_migrate__marks_stale_cache_as_migrated_when_walk_produces_no_changes() {
		// Arrange - data already in target shape, cache empty.
		$orchestrator = Migrations_Orchestrator::make();
		$post_id = 6006;

		Migrations_Cache::clear_migration_cache( $post_id, '_elementor_data' );

		$data = $this->get_target_shape_data();
		$save_called = false;

		// Act
		$orchestrator->migrate(
			$data,
			$post_id,
			'_elementor_data',
			function () use ( &$save_called ) {
				$save_called = true;
				return true;
			}
		);

		// Assert - no changes -> save should NOT be called, but the cache should still be marked
		// so subsequent loads short-circuit the walk overhead.
		$loader = $this->get_orchestrator_loader( $orchestrator );
		$this->assertFalse( $save_called, 'save_callback must not run when the walk produced no changes.' );
		$this->assertTrue( Migrations_Cache::is_migrated( $post_id, '_elementor_data', $loader->get_manifest_hash() ) );
	}

	private function get_orchestrator_loader( Migrations_Orchestrator $orchestrator ): Migrations_Loader {
		$reflection = new \ReflectionClass( $orchestrator );
		$loader_property = $reflection->getProperty( 'loader' );
		$loader_property->setAccessible( true );

		return $loader_property->getValue( $orchestrator );
	}

	private function get_sample_data(): array {
		return [
			[
				'id' => 'heading-1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'title' => [
						'$$type' => 'string',
						'value' => 'Hello',
					],
				],
			],
		];
	}

	/**
	 * Legacy payload for `e-heading.title`. The current schema expects `$$type: html-v3`, so any
	 * walk should produce changes (has_changes = true) and invoke the save callback.
	 */
	private function get_migrateable_data(): array {
		return [
			[
				'id' => 'heading-1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'title' => [
						'$$type' => 'string',
						'value' => 'Hello',
					],
				],
			],
		];
	}

	/**
	 * Payload already in the current schema shape (`$$type: html-v3`) so the walk produces no
	 * changes.
	 */
	private function get_target_shape_data(): array {
		return [
			[
				'id' => 'heading-2',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'title' => [
						'$$type' => 'html-v3',
						'value' => [
							'content'  => [ '$$type' => 'string', 'value' => 'Hello' ],
							'children' => [],
						],
					],
				],
			],
		];
	}
}
