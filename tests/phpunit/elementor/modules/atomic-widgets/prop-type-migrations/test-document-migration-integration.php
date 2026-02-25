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

class Mock_String_V2_Integration_Prop_Type extends \Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type {
	public static function get_key(): string {
		return 'string';
	}
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

	public function add_css_prop_to_style_schema( $schema ): array {
		return array_merge( $schema, [ 'css_prop' => Mock_String_V2_Integration_Prop_Type::make() ] );
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
		$orchestrator->migrate(
			$data,
			$post_id,
			'test_document_data',
			function() {}
		);

		// Assert
		$this->assertMatchesJsonSnapshot( $data );
	}

	public function test_document_and_global_classes_migrations_do_not_interfere() {
		// Arrange
		add_filter( 'elementor/atomic-widgets/styles/schema', [ $this, 'add_css_prop_to_style_schema' ], 999999 );

		$post_id = 1000;

		$document_data = [
			[
				'id' => 'element_1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'title' => [
						'$$type' => 'html',
						'value' => 'Document Title',
					],
				],
			],
		];

		$global_classes_data = [
			'items' => [
				[
					'id' => 'gc_1',
					'type' => 'class',
					'label' => 'Global Class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'css_prop' => [
									'$$type' => 'old-string',
									'value' => 'Global Style',
								],
							],
						],
					],
				],
			],
			'order' => ['gc_1'],
		];

		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		// Act
		$orchestrator->migrate(
			$document_data,
			$post_id,
			'_elementor_data',
			function() {}
		);

		$orchestrator->migrate(
			$global_classes_data,
			$post_id,
			'_elementor_global_classes',
			function() {}
		);

		// Assert
		$this->assertEquals( 'html-v3', $document_data[0]['settings']['title']['$$type'] );
		$this->assertEquals( 'string', $global_classes_data['items'][0]['variants'][0]['props']['css_prop']['$$type'] );

		remove_filter( 'elementor/atomic-widgets/styles/schema', [ $this, 'add_css_prop_to_style_schema' ], 999999 );
	}

	public function test_interactions_migrations() {
		// Arrange
		$post_id = 1001;

		$document_data = [
			[
				'id' => 'element_with_interactions',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'title' => [
						'$$type' => 'html',
						'value' => 'Interactive Element',
					],
				],
				'interactions' => [
					'items' => [
						[
							'$$type' => 'interaction-item',
							'value' => [
								'interaction_id' => [
									'$$type' => 'old-string',
									'value' => 'test-interaction',
								],
								'trigger' => [
									'$$type' => 'string',
									'value' => 'click',
								],
								'animation' => [
									'$$type' => 'animation-preset',
									'value' => 'fade-in',
								],
							],
						],
					],
				],
			],
		];

		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );

		// Act
		$orchestrator->migrate(
			$document_data,
			$post_id,
			'_elementor_data',
			function() {}
		);

		// Assert
		$this->assertArrayHasKey( 'interactions', $document_data[0] );
		$this->assertArrayHasKey( 'items', $document_data[0]['interactions'] );
		$this->assertCount( 1, $document_data[0]['interactions']['items'] );
		$this->assertEquals( 'interaction-item', $document_data[0]['interactions']['items'][0]['$$type'] );
		$this->assertEquals( 'string', $document_data[0]['interactions']['items'][0]['value']['interaction_id']['$$type'], 'interaction_id should be migrated from old-string to string' );
	}

	public function test_widget_migration_edge_cases() {
		// Arrange
		$data = json_decode(
			file_get_contents( $this->fixtures_path . 'widget-edge-cases.json' ),
			true
		);

		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );
		$post_id = 2000;

		// Act
		$orchestrator->migrate(
			$data,
			$post_id,
			'test_widget_edge_cases',
			function() {}
		);

		// Assert
		$this->assertMatchesJsonSnapshot( $data );
	}
}
