<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Core\Documents_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Documents\Component_Overridable_Props;
use Elementor\Modules\Components\Overridable_Schema_Extender;
use Elementor\Modules\Components\Widgets\Component_Instance;
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

class Mock_Migration_Component_Document extends Component_Document {
	private array $mock_overridable_props;

	public function __construct( array $overridable_props ) {
		$this->mock_overridable_props = $overridable_props;
	}

	public function get_overridable_props(): Component_Overridable_Props {
		return Component_Overridable_Props::make( $this->mock_overridable_props );
	}
}

/**
 * @group prop-type-migrations
 * @group integration
 */
class Test_Document_Migration_Integration extends Elementor_Test_Base {
	use MatchesSnapshots;

	const COMPONENT_ID = 1530;

	private string $fixtures_path = __DIR__ . '/fixtures/document-migrations/';

	private array $registered_widgets = [];

	private array $registered_elements = [];

	private ?Documents_Manager $original_documents_manager = null;

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

		if ( ! $widgets_manager->get_widget_types( 'e-component' ) ) {
			$widgets_manager->register( new Component_Instance( [], [] ) );
			$this->registered_widgets[] = 'e-component';
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

		if ( $this->original_documents_manager ) {
			Plugin::$instance->documents = $this->original_documents_manager;
			$this->original_documents_manager = null;
		}

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

	public function extend_schema_with_overridable( $schema ) {
		return Overridable_Schema_Extender::make()->get_extended_schema( $schema );
	}

	public function test_migrate_prop_nested_inside_overridable() {
		// Arrange
		add_filter( 'elementor/atomic-widgets/props-schema', [ $this, 'extend_schema_with_overridable' ], 999999 );

		$document_data = json_decode(
			file_get_contents( $this->fixtures_path . 'overridable-migration-data.json' ),
			true
		);

		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );
		$post_id = 1002;

		// Act
		$orchestrator->migrate(
			$document_data,
			$post_id,
			'_elementor_data',
			function() {}
		);

		// Assert
		$this->assertEquals( 'overridable', $document_data[0]['settings']['title']['$$type'] );
		$this->assertEquals( 'html-v3', $document_data[0]['settings']['title']['value']['origin_value']['$$type'], 'origin_value should be migrated from html to html-v3' );
		$this->assertEquals( 'prop-123', $document_data[0]['settings']['title']['value']['override_key'] );

		remove_filter( 'elementor/atomic-widgets/props-schema', [ $this, 'extend_schema_with_overridable' ], 999999 );
	}

	public function test_migrate_override_value_inside_component_instance() {
		// Arrange
		add_filter( 'elementor/atomic-widgets/props-schema', [ $this, 'extend_schema_with_overridable' ], 999999 );
		$this->mock_component_documents_manager();

		$document_data = json_decode(
			file_get_contents( $this->fixtures_path . 'overridable-migration-data.json' ),
			true
		);

		$element_data = [ $document_data[1] ];

		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );
		$post_id = 1003;

		// Act
		$orchestrator->migrate(
			$element_data,
			$post_id,
			'_elementor_data',
			function() {}
		);

		// Assert
		$override = $element_data[0]['settings']['component_instance']['value']['overrides']['value'][0];
		$this->assertEquals( 'override', $override['$$type'] );
		$this->assertEquals( 'html-v3', $override['value']['override_value']['$$type'], 'override_value should be migrated from html to html-v3' );

		remove_filter( 'elementor/atomic-widgets/props-schema', [ $this, 'extend_schema_with_overridable' ], 999999 );
	}

	public function test_migrate_override_value_nested_inside_overridable_and_override() {
		// Arrange
		add_filter( 'elementor/atomic-widgets/props-schema', [ $this, 'extend_schema_with_overridable' ], 999999 );
		$this->mock_component_documents_manager();

		$document_data = json_decode(
			file_get_contents( $this->fixtures_path . 'overridable-migration-data.json' ),
			true
		);

		$element_data = [ $document_data[2] ];

		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );
		$post_id = 1004;

		// Act
		$orchestrator->migrate(
			$element_data,
			$post_id,
			'_elementor_data',
			function() {}
		);

		// Assert
		$overridable_item = $element_data[0]['elements'][0]['settings']['component_instance']['value']['overrides']['value'][0];
		$this->assertEquals( 'overridable', $overridable_item['$$type'] );

		$inner_override = $overridable_item['value']['origin_value'];
		$this->assertEquals( 'override', $inner_override['$$type'] );
		$this->assertEquals( 'html-v3', $inner_override['value']['override_value']['$$type'], 'nested override_value should be migrated from html to html-v3' );

		remove_filter( 'elementor/atomic-widgets/props-schema', [ $this, 'extend_schema_with_overridable' ], 999999 );
	}

	private function mock_component_documents_manager(): void {
		$this->original_documents_manager = Plugin::$instance->documents;

		$overridable_props = [
			'props' => [
				'prop-1774948276142-hbvo1d6' => [
					'overrideKey' => 'prop-1774948276142-hbvo1d6',
					'label' => 'Heading Title',
					'elementId' => 'heading-123',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'title',
					'originValue' => [
						'$$type' => 'html-v3',
						'value' => 'Original Title',
					],
				],
			],
			'groups' => [],
		];

		$mock_doc = new Mock_Migration_Component_Document( $overridable_props );

		$documents_mock = $this->getMockBuilder( Documents_Manager::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'get', 'get_doc_or_auto_save' ] )
			->getMock();

		$documents_mock->method( 'get_doc_or_auto_save' )->willReturnCallback(
			function ( $post_id ) use ( $mock_doc ) {
				if ( $post_id === self::COMPONENT_ID ) {
					return $mock_doc;
				}
				return $this->original_documents_manager->get_doc_or_auto_save( $post_id );
			}
		);

		$documents_mock->method( 'get' )->willReturnCallback(
			function ( $post_id ) use ( $mock_doc ) {
				if ( $post_id === self::COMPONENT_ID ) {
					return $mock_doc;
				}
				return $this->original_documents_manager->get( $post_id );
			}
		);

		Plugin::$instance->documents = $documents_mock;
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
