<?php

namespace Elementor\Testing\Modules\Components\ImportExportCustomization;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Modules\Components\Widgets\Component_Instance;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Export as Export_Runner;
use Elementor\Plugin;
use Elementor\Testing\Modules\KitElementsDefaults\ImportExportCustomization\Runners\Mock_Control_Kits_Defaults;
use Elementor\Testing\Modules\KitElementsDefaults\ImportExportCustomization\Runners\Mock_Widget_Kits_Defaults;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../../kit-elements-defaults/import-export-customization/runners/mock/mock-control-kits-defaults.php';
require_once __DIR__ . '/../../kit-elements-defaults/import-export-customization/runners/mock/mock-widget-kits-defaults.php';

class Test_Export_Runner extends Elementor_Test_Base {
	private string $original_atomic_widgets_experiment_state;
	private bool $registered_component_widget = false;

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

		Plugin::$instance->controls_manager->get_controls();
		Plugin::$instance->controls_manager->unregister( Mock_Control_Kits_Defaults::NAME );
		Plugin::$instance->controls_manager->register( new Mock_Control_Kits_Defaults() );

		Plugin::$instance->widgets_manager->unregister( Mock_Widget_Kits_Defaults::NAME );
		Plugin::$instance->widgets_manager->register( new Mock_Widget_Kits_Defaults() );

		if ( ! Plugin::$instance->widgets_manager->get_widget_types( Component_Instance::get_element_type() ) ) {
			Plugin::$instance->widgets_manager->register( new Component_Instance( [], [] ) );
			$this->registered_component_widget = true;
		}
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

		Plugin::$instance->widgets_manager->unregister( Mock_Widget_Kits_Defaults::NAME );
		Plugin::$instance->controls_manager->unregister( Mock_Control_Kits_Defaults::NAME );

		if ( $this->registered_component_widget ) {
			Plugin::$instance->widgets_manager->unregister( Component_Instance::get_element_type() );
		}

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			$this->original_atomic_widgets_experiment_state
		);

		parent::tearDown();
	}

	public function test_export__returns_component_files_manifest_and_dependencies() {
		// Arrange
		$runner = new Export_Runner();
		$inner = $this->create_component(
			'Inner Component',
			[
				$this->build_mock_widget_element( 'inner-widget-id' ),
			],
			[
				'kept_setting' => 'keep me',
				'overridable_props' => [ 'stale' => true ],
				'variants' => [ 'stale' => true ],
			],
			'test-uid-123',
			[
				'props' => [],
				'groups' => [
					'items' => [],
					'order' => [],
				],
			]
		);
		$outer = $this->create_component(
			'Archived Component',
			[
				$this->build_component_instance_element( $inner->get_main_id() ),
			],
			[],
			null,
			null,
			[
				'is_archived' => true,
				'archived_at' => time(),
			]
		);

		// Act
		$result = $runner->export( [] );

		// Assert
		$this->assertCount( 2, $result['manifest'][0][ Component_Document::EXPORT_MANIFEST_KEY ] );
		$this->assertSame( $inner->get_export_summary(), $result['manifest'][0][ Component_Document::EXPORT_MANIFEST_KEY ][ $inner->get_main_id() ] );
		$this->assertSame( $outer->get_export_summary(), $result['manifest'][0][ Component_Document::EXPORT_MANIFEST_KEY ][ $outer->get_main_id() ] );

		$files_by_path = $this->index_files_by_path( $result['files'] );
		$inner_file = $files_by_path[ Component_Document::EXPORT_DIRECTORY . $inner->get_main_id() ]['data'];
		$outer_file = $files_by_path[ Component_Document::EXPORT_DIRECTORY . $outer->get_main_id() ]['data'];
		$dependencies = $files_by_path[ Component_Document::EXPORT_DIRECTORY . Component_Document::EXPORT_DEPENDENCIES_FILE_NAME ]['data']['dependencies'];

		$this->assertSame( 'inner-widget-id', $inner_file['content'][0]['id'] );
		$this->assertSame( 'value changed on export', $inner_file['content'][0]['settings']['mock-control-1'] );
		$this->assertArrayNotHasKey( 'remove_because_has_export_false', $inner_file['content'][0]['settings'] );
		$this->assertArrayNotHasKey( 'removed_on_import_and_on_export_method', $inner_file['content'][0]['settings'] );
		$this->assertSame( 'keep me', $inner_file['settings']['kept_setting'] );
		$this->assertArrayNotHasKey( 'overridable_props', $inner_file['settings'] );
		$this->assertArrayNotHasKey( 'variants', $inner_file['settings'] );
		$this->assertSame( 'test-uid-123', $inner_file['metadata'][ Component_Document::COMPONENT_UID_META_KEY ] );
		$this->assertSame(
			[
				'props' => [],
				'groups' => [
					'items' => [],
					'order' => [],
				],
			],
			$inner_file['metadata'][ Component_Document::OVERRIDABLE_PROPS_META_KEY ]
		);
		$this->assertSame( 'component-instance-id', $outer_file['content'][0]['id'] );
		$this->assertSame( [], $dependencies[ $inner->get_main_id() ]['depends_on'] );
		$this->assertSame( [ $inner->get_main_id() ], $dependencies[ $outer->get_main_id() ]['depends_on'] );
	}

	public function test_should_export__requires_content_to_be_included() {
		// Arrange
		$runner = new Export_Runner();

		// Act
		$without_content = $runner->should_export( [ 'include' => [ 'settings' ] ] );
		$with_content = $runner->should_export( [ 'include' => [ 'content' ] ] );

		// Assert
		$this->assertFalse( $without_content );
		$this->assertTrue( $with_content );
	}

	private function create_component(
		string $title,
		array $elements,
		array $page_settings = [],
		?string $uid = null,
		?array $overridable_props = null,
		?array $archived = null
	): Component_Document {
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => $title,
				'post_status' => 'publish',
			]
		);

		$document->save( [
			'elements' => $elements,
		] );

		update_post_meta( $document->get_main_id(), '_elementor_edit_mode', 'builder' );
		update_post_meta( $document->get_main_id(), '_elementor_page_settings', $page_settings );

		if ( null !== $uid ) {
			$document->update_meta( Component_Document::COMPONENT_UID_META_KEY, $uid );
		}

		if ( null !== $overridable_props ) {
			$document->update_json_meta( Component_Document::OVERRIDABLE_PROPS_META_KEY, $overridable_props );
		}

		if ( null !== $archived ) {
			$document->update_json_meta( Component_Document::ARCHIVED_META_KEY, $archived );
		}

		return Plugin::$instance->documents->get( $document->get_main_id() );
	}

	private function build_mock_widget_element( string $id ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => Mock_Widget_Kits_Defaults::NAME,
			'elements' => [],
			'settings' => [
				'text' => 'Plain text',
				'remove_because_has_export_false' => 'remove me',
				'removed_on_import_and_on_export_method' => 'remove me too',
				'mock-control-1' => 'value',
			],
		];
	}

	private function build_component_instance_element( int $component_id ): array {
		return [
			'id' => 'component-instance-id',
			'elType' => 'widget',
			'widgetType' => Component_Instance::get_element_type(),
			'elements' => [],
			'settings' => [
				'component_instance' => [
					'$$type' => 'component-instance',
					'value' => [
						'component_id' => [
							'$$type' => 'number',
							'value' => $component_id,
						],
					],
				],
			],
			'styles' => [],
		];
	}

	private function index_files_by_path( array $files ): array {
		$result = [];

		foreach ( $files as $file ) {
			$result[ $file['path'] ] = $file;
		}

		return $result;
	}
}
