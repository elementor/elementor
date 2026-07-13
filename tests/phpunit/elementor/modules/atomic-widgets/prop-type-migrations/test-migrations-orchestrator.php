<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

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
		$fetch_count = 0;

		add_filter( 'pre_http_request', function () use ( &$fetch_count ) {
			$fetch_count++;
			return new \WP_Error( 'http_request_failed', 'Connection timed out' );
		} );

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
		$this->assertEquals( 1, $fetch_count );
		$this->assertFalse( get_transient( 'elementor_migrations_manifest' ) );

		$loader = $this->get_orchestrator_loader( $orchestrator );
		$this->assertNotNull( $loader->find_migration_path( 'string', 'html' ) );
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
}
