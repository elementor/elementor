<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Loader;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 * @group integration
 */
class Test_Document_Migration_Integration extends Elementor_Test_Base {
	use MatchesSnapshots;

	private string $fixtures_path = __DIR__ . '/fixtures/document-migrations/';

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->widgets_manager->register( new Atomic_Heading( [], [] ) );
		Plugin::$instance->widgets_manager->register( new \Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image( [], [] ) );

		Migrations_Orchestrator::clear_all_migration_caches();
	}

	public function tearDown(): void {
		Migrations_Orchestrator::destroy();
		Migrations_Loader::destroy();

		Plugin::$instance->widgets_manager->unregister( 'e-heading' );
		Plugin::$instance->widgets_manager->unregister( 'e-image' );

		parent::tearDown();
	}

	public function test_migrate_real_site_data_with_multiple_prop_types() {
		// Arrange
		$data = json_decode(
			file_get_contents( $this->fixtures_path . 'old-schema-data.json' ),
			true
		);

		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		$post_id = 999;

		// Act
		$orchestrator->migrate_document(
			$data,
			$post_id,
			function() {}
		);

		// Assert
		$this->assertMatchesJsonSnapshot( $data );
	}
}

