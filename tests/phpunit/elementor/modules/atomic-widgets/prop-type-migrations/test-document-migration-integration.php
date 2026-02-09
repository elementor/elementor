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

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		
		if ( ! defined( 'ELEMENTOR_MIGRATIONS_PATH' ) ) {
			define( 'ELEMENTOR_MIGRATIONS_PATH', __DIR__ . '/fixtures/document-migrations/' );
		}
	}

	// public function setUp(): void {
	// 	parent::setUp();

	// 	Plugin::$instance->widgets_manager->register( new Atomic_Heading( [], [] ) );
	// 	Plugin::$instance->widgets_manager->register( new \Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image( [], [] ) );
	// 	Plugin::$instance->elements_manager->register_element_type( new \Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox( [], [] ) );
	// 	Plugin::$instance->elements_manager->register_element_type( new \Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block( [], [] ) );

	// 	Migrations_Orchestrator::clear_migration_cache();
	// }

	// public function tearDown(): void {
	// 	Plugin::$instance->widgets_manager->unregister( 'e-heading' );
	// 	Plugin::$instance->widgets_manager->unregister( 'e-image' );
	// 	Plugin::$instance->elements_manager->unregister_element_type( 'e-flexbox' );
	// 	Plugin::$instance->elements_manager->unregister_element_type( 'e-div-block' );

	// 	Migrations_Orchestrator::destroy();
	// 	Migrations_Loader::destroy();

	// 	parent::tearDown();
	// }


	public function test_migrate_real_site_data_with_multiple_prop_types() {
		$this->markTestSkipped( 'Test disabled: widget registration pollutes global state and breaks other tests. Needs investigation into proper isolation strategy.' );
		return;

		$data = json_decode(
			file_get_contents( $this->fixtures_path . 'old-schema-data.json' ),
			true
		);

		$orchestrator = Migrations_Orchestrator::make();

		$post_id = 999;

		$orchestrator->migrate(
			$data,
			$post_id,
			function() {}
		);

		$this->assertMatchesJsonSnapshot( $data );
	}
}

