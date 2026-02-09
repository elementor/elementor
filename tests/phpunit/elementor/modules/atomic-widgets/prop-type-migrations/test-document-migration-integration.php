<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
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

	private array $registered_widgets = [];

	private array $registered_elements = [];

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		Migrations_Orchestrator::destroy();
	}

	public function setUp(): void {
		parent::setUp();

		$widgets_manager = Plugin::$instance->widgets_manager;
		$elements_manager = Plugin::$instance->elements_manager;

		if ( ! $widgets_manager->get_widget_types( 'e-heading' ) ) {
			$widgets_manager->register( new Atomic_Heading( [], [] ) );
			$this->registered_widgets[] = 'e-heading';
		}

		if ( ! $widgets_manager->get_widget_types( 'e-image' ) ) {
			$widgets_manager->register( new Atomic_Image( [], [] ) );
			$this->registered_widgets[] = 'e-image';
		}

		if ( ! $elements_manager->get_element_types( 'e-flexbox' ) ) {
			$elements_manager->register_element_type( new Flexbox( [], [] ) );
			$this->registered_elements[] = 'e-flexbox';
		}

		if ( ! $elements_manager->get_element_types( 'e-div-block' ) ) {
			$elements_manager->register_element_type( new Div_Block( [], [] ) );
			$this->registered_elements[] = 'e-div-block';
		}

		Migrations_Orchestrator::clear_migration_cache();
	}

	public function tearDown(): void {
		$widgets_manager = Plugin::$instance->widgets_manager;
		$elements_manager = Plugin::$instance->elements_manager;

		foreach ( $this->registered_widgets as $widget_name ) {
			$widgets_manager->unregister( $widget_name );
		}

		foreach ( $this->registered_elements as $element_name ) {
			$elements_manager->unregister_element_type( $element_name );
		}

		$this->registered_widgets = [];
		$this->registered_elements = [];

		Migrations_Orchestrator::destroy();

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

