<?php

namespace Elementor\Testing\Modules\Components\ImportExportCustomization;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Components\Components_REST_API;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Import as Import_Runner;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\Components\Utils\Component_Title_Duplicator;
use Elementor\Modules\Components\Widgets\Component_Instance;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Import_Runner extends Elementor_Test_Base {
	const INNER_SOURCE_ID = 501;
	const OUTER_SOURCE_ID = 502;
	const MISSING_SOURCE_ID = 999;
	const SESSION_ID = 'test-session';
	const OVERRIDE_KEY = 'prop-111';

	private string $original_atomic_widgets_experiment_state;
	private bool $registered_component_widget = false;
	private string $kit_path;
	private array $manifest = [];

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		$this->original_atomic_widgets_experiment_state = Plugin::$instance->experiments
			->get_features( Atomic_Widgets_Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		new Components_Module();

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		if ( ! Plugin::$instance->widgets_manager->get_widget_types( Component_Instance::get_element_type() ) ) {
			Plugin::$instance->widgets_manager->register( new Component_Instance( [], [] ) );
			$this->registered_component_widget = true;
		}

		$this->kit_path = trailingslashit( get_temp_dir() ) . 'components-import-' . uniqid() . '/';
		wp_mkdir_p( $this->kit_path . Component_Document::EXPORT_DIRECTORY );
	}

	public function tearDown(): void {
		$components = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}

		Plugin::$instance->uploads_manager->remove_file_or_dir( $this->kit_path );

		if ( $this->registered_component_widget ) {
			Plugin::$instance->widgets_manager->unregister( Component_Instance::get_element_type() );
		}

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			$this->original_atomic_widgets_experiment_state
		);

		parent::tearDown();
	}

	public function test_should_import__follows_gate_when_content_is_included_and_manifest_has_components() {
		// Arrange
		$runner = new Import_Runner();
		$data = [
			'include' => [ 'content' ],
			'manifest' => [
				Component_Document::EXPORT_MANIFEST_KEY => [
					123 => [ 'title' => 'Component' ],
				],
			],
			'extracted_directory_path' => '/tmp/kit/',
		];

		// Act
		$result = $runner->should_import( $data );

		// Assert
		$this->assertSame( Components_Module::is_import_export_supported(), $result );
	}

	public function test_should_import__returns_false_when_content_is_not_included() {
		// Arrange
		$runner = new Import_Runner();
		$data = [
			'include' => [ 'settings' ],
			'manifest' => [
				Component_Document::EXPORT_MANIFEST_KEY => [
					123 => [ 'title' => 'Component' ],
				],
			],
			'extracted_directory_path' => '/tmp/kit/',
		];

		// Act
		$result = $runner->should_import( $data );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_import__returns_false_when_manifest_has_no_components() {
		// Arrange
		$runner = new Import_Runner();
		$data = [
			'include' => [ 'content' ],
			'manifest' => [],
			'extracted_directory_path' => '/tmp/kit/',
		];

		// Act
		$result = $runner->should_import( $data );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_import__returns_false_for_legacy_manifest_content_entry() {
		// Arrange
		$runner = new Import_Runner();
		$data = [
			'include' => [ 'content' ],
			'manifest' => [
				'content' => [
					Component_Document::TYPE => [
						123 => [ 'title' => 'Component' ],
					],
				],
			],
			'extracted_directory_path' => '/tmp/kit/',
		];

		// Act
		$result = $runner->should_import( $data );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_import__creates_dependencies_first_with_regenerated_element_ids() {
		// Arrange
		$this->write_kit( [
			self::OUTER_SOURCE_ID => $this->build_kit_entry( 'Outer', [ $this->build_instance_element( 'outer-instance', self::INNER_SOURCE_ID ) ], 'uid-outer' ),
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Inner', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-inner', $this->build_overridable_props( 'inner-heading' ) ),
		], [
			self::OUTER_SOURCE_ID => [ 'depends_on' => [ self::INNER_SOURCE_ID ] ],
			self::INNER_SOURCE_ID => [ 'depends_on' => [] ],
		] );

		// Act
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$succeed = $result['content'][ Component_Document::TYPE ]['succeed'];
		$this->assertSame( [ self::INNER_SOURCE_ID, self::OUTER_SOURCE_ID ], array_keys( $succeed ) );
		$this->assertLessThan( $succeed[ self::OUTER_SOURCE_ID ], $succeed[ self::INNER_SOURCE_ID ] );

		$inner = $this->get_component( $succeed[ self::INNER_SOURCE_ID ] );
		$new_heading_id = $inner->get_elements_data()[0]['id'];
		$this->assertNotSame( 'inner-heading', $new_heading_id );
		$this->assertSame( 'uid-inner', $inner->get_component_uid() );
		$this->assertSame( 'Inner', $inner->get_post()->post_title );
		$this->assertSame( self::SESSION_ID, get_post_meta( $inner->get_main_id(), '_elementor_import_session_id', true ) );

		$raw_overridable_props = get_post_meta( $inner->get_main_id(), Component_Document::OVERRIDABLE_PROPS_META_KEY, true );
		$this->assertIsString( $raw_overridable_props );
		$this->assertSame( $new_heading_id, json_decode( $raw_overridable_props, true )['props'][ self::OVERRIDE_KEY ]['elementId'] );
	}

	public function test_import__nested_prop_points_at_regenerated_ids_of_both_components() {
		// Arrange
		$outer_props = $this->build_overridable_props( 'outer-instance' );
		$outer_props['props'][ self::OVERRIDE_KEY ]['widgetType'] = Component_Instance::get_element_type();
		$outer_props['props'][ self::OVERRIDE_KEY ]['originValue'] = [
			'$$type' => 'override',
			'value' => [
				'override_key' => self::OVERRIDE_KEY,
				'override_value' => null,
				'schema_source' => [
					'type' => 'component',
					'id' => self::INNER_SOURCE_ID,
				],
			],
		];
		$outer_props['props'][ self::OVERRIDE_KEY ]['originPropFields'] = [
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'propKey' => 'title',
			'elementId' => 'inner-heading',
		];
		$this->write_kit( [
			self::OUTER_SOURCE_ID => $this->build_kit_entry( 'Outer', [ $this->build_instance_element( 'outer-instance', self::INNER_SOURCE_ID ) ], 'uid-outer', $outer_props ),
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Inner', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-inner', $this->build_overridable_props( 'inner-heading' ) ),
		], [
			self::OUTER_SOURCE_ID => [ 'depends_on' => [ self::INNER_SOURCE_ID ] ],
		] );

		// Act
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$succeed = $result['content'][ Component_Document::TYPE ]['succeed'];
		$inner = $this->get_component( $succeed[ self::INNER_SOURCE_ID ] );
		$outer = $this->get_component( $succeed[ self::OUTER_SOURCE_ID ] );
		$stored_prop = $outer->get_json_meta( Component_Document::OVERRIDABLE_PROPS_META_KEY )['props'][ self::OVERRIDE_KEY ];

		$this->assertNotSame( 'outer-instance', $outer->get_elements_data()[0]['id'] );
		$this->assertSame( $outer->get_elements_data()[0]['id'], $stored_prop['elementId'] );
		$this->assertSame( $inner->get_elements_data()[0]['id'], $stored_prop['originPropFields']['elementId'] );
		$this->assertSame( $succeed[ self::INNER_SOURCE_ID ], $stored_prop['originValue']['value']['schema_source']['id'] );
	}

	public function test_import__same_kit_twice_gets_distinct_element_ids() {
		// Arrange
		$this->write_kit( [
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Inner', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-inner' ),
		] );
		$first = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Act
		$second = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$first_id = $this->get_component( $first['content'][ Component_Document::TYPE ]['succeed'][ self::INNER_SOURCE_ID ] )->get_elements_data()[0]['id'];
		$second_id = $this->get_component( $second['content'][ Component_Document::TYPE ]['succeed'][ self::INNER_SOURCE_ID ] )->get_elements_data()[0]['id'];
		$this->assertNotSame( $first_id, $second_id );
	}

	public function test_import__writes_overridable_props_meta_as_is_without_validation() {
		// Arrange
		$unvalidated_props = [
			'props' => [
				self::OVERRIDE_KEY => [
					'overrideKey' => self::OVERRIDE_KEY,
					'unknown_field' => 'kept',
				],
			],
			'groups' => [
				'items' => [],
				'order' => [],
			],
		];
		$this->write_kit( [
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Inner', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-inner', $unvalidated_props ),
		] );

		// Act
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$inner = $this->get_component( $result['content'][ Component_Document::TYPE ]['succeed'][ self::INNER_SOURCE_ID ] );
		$this->assertSame( $unvalidated_props, $inner->get_json_meta( Component_Document::OVERRIDABLE_PROPS_META_KEY ) );
	}

	public function test_import__remaps_nested_origin_value_schema_source_in_meta() {
		// Arrange
		$outer_props = $this->build_overridable_props( 'outer-instance' );
		$outer_props['props'][ self::OVERRIDE_KEY ]['originValue'] = [
			'$$type' => 'override',
			'value' => [
				'override_key' => self::OVERRIDE_KEY,
				'override_value' => null,
				'schema_source' => [
					'type' => 'component',
					'id' => self::INNER_SOURCE_ID,
				],
			],
		];
		$this->write_kit( [
			self::OUTER_SOURCE_ID => $this->build_kit_entry( 'Outer', [ $this->build_instance_element( 'outer-instance', self::INNER_SOURCE_ID ) ], 'uid-outer', $outer_props ),
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Inner', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-inner', $this->build_overridable_props( 'inner-heading' ) ),
		], [
			self::OUTER_SOURCE_ID => [ 'depends_on' => [ self::INNER_SOURCE_ID ] ],
		] );

		// Act
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$succeed = $result['content'][ Component_Document::TYPE ]['succeed'];
		$outer = $this->get_component( $succeed[ self::OUTER_SOURCE_ID ] );
		$stored = $outer->get_json_meta( Component_Document::OVERRIDABLE_PROPS_META_KEY );
		$this->assertSame( $succeed[ self::INNER_SOURCE_ID ], $stored['props'][ self::OVERRIDE_KEY ]['originValue']['value']['schema_source']['id'] );
	}

	public function test_import__duplicate_uid_is_imported_as_copy() {
		// Arrange
		$existing = $this->create_existing_component( 'Shared', 'uid-shared' );
		$this->write_kit( [
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Shared', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-shared' ),
		] );

		// Act
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$imported = $this->get_component( $result['content'][ Component_Document::TYPE ]['succeed'][ self::INNER_SOURCE_ID ] );
		$this->assertNotSame( $existing, $imported->get_main_id() );
		$this->assertNotSame( 'uid-shared', $imported->get_component_uid() );
		$this->assertMatchesRegularExpression( '/^component-\d+-[a-z0-9]{7}$/', $imported->get_component_uid() );
		$this->assertSame( 'Shared' . Component_Title_Duplicator::SUFFIX, $imported->get_post()->post_title );
		$this->assertSame( 'uid-shared', $this->get_component( $existing )->get_component_uid() );
	}

	public function test_import__same_title_within_one_kit_gets_distinct_titles() {
		// Arrange
		$this->write_kit( [
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Shared', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-inner' ),
			self::OUTER_SOURCE_ID => $this->build_kit_entry( 'Shared', [ $this->build_heading_element( 'outer-heading' ) ], 'uid-outer' ),
		] );

		// Act
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$succeed = $result['content'][ Component_Document::TYPE ]['succeed'];
		$this->assertSame( 'Shared', $this->get_component( $succeed[ self::INNER_SOURCE_ID ] )->get_post()->post_title );
		$this->assertSame( 'Shared' . Component_Title_Duplicator::SUFFIX, $this->get_component( $succeed[ self::OUTER_SOURCE_ID ] )->get_post()->post_title );
	}

	public function test_import__same_kit_twice_gets_numbered_suffix() {
		// Arrange
		$this->create_existing_component( 'Shared', 'uid-existing' );
		$this->write_kit( [
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Shared', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-shared' ),
		] );
		( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Act
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$imported = $this->get_component( $result['content'][ Component_Document::TYPE ]['succeed'][ self::INNER_SOURCE_ID ] );
		$this->assertSame( 'Shared' . Component_Title_Duplicator::SUFFIX . '_2', $imported->get_post()->post_title );
	}

	public function test_import__restores_archived_flag_and_keeps_title() {
		// Arrange
		$this->create_existing_component( 'Archived', 'uid-other' );
		$archived = [
			'is_archived' => true,
			'archived_at' => 1700000000,
		];
		$file = $this->build_kit_entry( 'Archived', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-archived' );
		$file[1]['metadata'][ Component_Document::ARCHIVED_META_KEY ] = $archived;
		$this->write_kit( [ self::INNER_SOURCE_ID => $file ] );

		// Act
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$imported = $this->get_component( $result['content'][ Component_Document::TYPE ]['succeed'][ self::INNER_SOURCE_ID ] );
		$this->assertTrue( $imported->get_is_archived() );
		$this->assertSame( $archived, $imported->get_json_meta( Component_Document::ARCHIVED_META_KEY ) );
		$this->assertSame( 'Archived', $imported->get_post()->post_title );
	}

	public function test_import__over_limit_component_is_failed_and_deleted() {
		// Arrange
		$this->factory()->post->create_many( Components_REST_API::MAX_COMPONENTS, [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'publish',
		] );
		$this->write_kit( [
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Over Limit', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-over-limit' ),
		] );

		// Act
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );

		// Assert
		$this->assertArrayHasKey( self::INNER_SOURCE_ID, $result['content'][ Component_Document::TYPE ]['failed'] );
		$this->assertEmpty( $result['content'][ Component_Document::TYPE ]['succeed'] );
		$this->assertEmpty( get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'title' => 'Over Limit',
			'fields' => 'ids',
		] ) );
	}

	public function test_import__missing_component_file_is_failed() {
		// Arrange
		$this->write_kit( [] );
		$data = $this->build_runner_data();
		$data['manifest'][ Component_Document::EXPORT_MANIFEST_KEY ][ self::MISSING_SOURCE_ID ] = $this->build_summary( 'Missing' );

		// Act
		$result = ( new Import_Runner() )->import( $data, [] );

		// Assert
		$this->assertArrayHasKey( self::MISSING_SOURCE_ID, $result['content'][ Component_Document::TYPE ]['failed'] );
	}

	public function test_import__page_instance_with_overrides_is_remapped_and_valid() {
		if ( ! Components_Module::is_import_export_supported() ) {
			$this->markTestSkipped( 'Components import/export is gated off.' );
		}

		// Arrange
		$this->write_kit( [
			self::INNER_SOURCE_ID => $this->build_kit_entry( 'Inner', [ $this->build_heading_element( 'inner-heading' ) ], 'uid-inner', $this->build_overridable_props( 'inner-heading' ) ),
		] );
		$result = ( new Import_Runner() )->import( $this->build_runner_data(), [] );
		$component_ids_map = $result['content'][ Component_Document::TYPE ]['succeed'];
		$new_inner_id = $component_ids_map[ self::INNER_SOURCE_ID ];
		$page_elements = [
			$this->build_instance_element( 'page-instance', self::INNER_SOURCE_ID, true ),
			$this->build_instance_element( 'page-unmapped-instance', self::MISSING_SOURCE_ID ),
		];

		// Act
		$prepared = Components_Module::prepare_imported_elements( $page_elements, $component_ids_map );

		// Assert
		$this->assertCount( 1, $prepared );
		$instance = $prepared[0]['settings']['component_instance'];
		$this->assertSame( $new_inner_id, $instance['value']['component_id']['value'] );
		$this->assertSame( $new_inner_id, $instance['value']['overrides']['value'][0]['value']['schema_source']['id'] );
		$this->assertTrue( Component_Instance_Prop_Type::make()->validate( $instance ) );
	}

	private function build_runner_data(): array {
		return [
			'include' => [ 'content' ],
			'session_id' => self::SESSION_ID,
			'extracted_directory_path' => $this->kit_path,
			'manifest' => [
				Component_Document::EXPORT_MANIFEST_KEY => $this->manifest,
			],
		];
	}

	private function build_summary( string $title ): array {
		return [
			'title' => $title,
			'doc_type' => Component_Document::TYPE,
			'thumbnail' => false,
		];
	}

	private function write_kit( array $files, array $dependencies = [] ): void {
		$directory = $this->kit_path . Component_Document::EXPORT_DIRECTORY;

		foreach ( $files as $source_id => [ $title, $data ] ) {
			$this->manifest[ $source_id ] = $this->build_summary( $title );
			file_put_contents( $directory . $source_id . '.json', wp_json_encode( $data ) );
		}

		file_put_contents(
			$directory . Component_Document::EXPORT_DEPENDENCIES_FILE_NAME . '.json',
			wp_json_encode( [ 'dependencies' => $dependencies ] )
		);
	}

	private function build_kit_entry( string $title, array $content, string $uid, ?array $overridable_props = null ): array {
		$metadata = [
			Component_Document::COMPONENT_UID_META_KEY => $uid,
		];

		if ( null !== $overridable_props ) {
			$metadata[ Component_Document::OVERRIDABLE_PROPS_META_KEY ] = $overridable_props;
		}

		return [
			$title,
			[
				'content' => $content,
				'settings' => [],
				'metadata' => $metadata,
			],
		];
	}

	private function build_overridable_props( string $element_id ): array {
		return [
			'props' => [
				self::OVERRIDE_KEY => [
					'overrideKey' => self::OVERRIDE_KEY,
					'label' => 'Title',
					'elementId' => $element_id,
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'title',
					'originValue' => [
						'$$type' => 'escaped-html',
						'value' => 'Original Title',
					],
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id' => 'group-1',
						'label' => 'Heading',
						'props' => [ self::OVERRIDE_KEY ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];
	}

	private function build_heading_element( string $id ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [],
			'elements' => [],
		];
	}

	private function build_instance_element( string $id, int $component_id, bool $with_override = false ): array {
		$value = [
			'component_id' => [
				'$$type' => 'number',
				'value' => $component_id,
			],
		];

		if ( $with_override ) {
			$value['overrides'] = [
				'$$type' => 'overrides',
				'value' => [
					[
						'$$type' => 'override',
						'value' => [
							'override_key' => self::OVERRIDE_KEY,
							'override_value' => null,
							'schema_source' => [
								'type' => 'component',
								'id' => $component_id,
							],
						],
					],
				],
			];
		}

		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => Component_Instance::get_element_type(),
			'settings' => [
				'component_instance' => [
					'$$type' => 'component-instance',
					'value' => $value,
				],
			],
			'elements' => [],
		];
	}

	private function create_existing_component( string $title, string $uid ): int {
		$document = Plugin::$instance->documents->create(
			Component_Document::TYPE,
			[
				'post_title' => $title,
				'post_status' => 'publish',
			],
			[
				Component_Document::COMPONENT_UID_META_KEY => $uid,
			]
		);

		return $document->get_main_id();
	}

	private function get_component( int $id ): Component_Document {
		return Plugin::$instance->documents->get( $id, false );
	}
}
