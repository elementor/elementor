<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Processes;

use Elementor\App\Modules\ImportExportCustomization\Kit_Context;
use Elementor\App\Modules\ImportExportCustomization\Processes\Import;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor
 * @group Elementor/ImportExportCustomization
 * @group Elementor/ImportExportCustomization/Processes
 *
 * @group kit-import-export-customization
 */
class Test_Import_Context extends Elementor_Test_Base {
	private $original_documents_manager;

	public function tearDown(): void {
		if ( null !== $this->original_documents_manager ) {
			Plugin::$instance->documents = $this->original_documents_manager;
			$this->original_documents_manager = null;
		}

		parent::tearDown();
	}

	public function test_group_api__supports_seeded_null_and_context_only_groups() {
		$context = new Kit_Context();

		$variables_group = $context->group( Kit_Context::GROUP_GLOBAL_VARIABLES );
		$variables_group->put( 'e-gv-old', null );

		$classes_group = $context->group( Kit_Context::GROUP_GLOBAL_CLASSES );
		$classes_group->put( 'g-old', 'g-new' );

		$this->assertTrue( $variables_group->has( 'e-gv-old' ) );
		$this->assertNull( $variables_group->value_of( 'e-gv-old' ) );
		$this->assertSame( [ 'e-gv-old' => null ], $variables_group->as_array() );
		$this->assertSame( [
			'class_ids' => [
				'g-old' => 'g-new',
			],
		], $context->to_replacements() );
	}

	public function test_set_import_object__restores_context_from_session_state() {
		$import = $this->make_import_process();

		$this->invoke_method( $import, 'set_import_object', [
			[
				'session_id' => 'test-session',
				'instance_data' => [
					'extracted_directory_path' => '',
					'runners' => [],
					'runner_priorities' => [],
					'adapters' => [],
					'manifest' => [],
					'site_settings' => [],
					'kit_id' => '',
					'settings_include' => [],
					'settings_referrer' => 'local',
					'settings_conflicts' => [],
					'settings_selected_override_conditions' => [],
					'settings_selected_custom_post_types' => [],
					'settings_selected_plugins' => [],
					'settings_customization' => [],
					'documents_data' => [],
					'imported_data' => [],
					'runners_import_metadata' => [],
					'context' => [
						Kit_Context::GROUP_GLOBAL_CLASSES => [
							'g-old' => 'g-new',
						],
					],
				],
			],
		] );

		$context = $this->get_property( $import, 'context' );

		$this->assertTrue( $context->group( Kit_Context::GROUP_GLOBAL_CLASSES )->has( 'g-old' ) );
		$this->assertSame( 'g-new', $context->group( Kit_Context::GROUP_GLOBAL_CLASSES )->value_of( 'g-old' ) );
	}

	public function test_get_imported_data_replacements__merges_context_with_legacy_maps() {
		$import = $this->make_import_process();
		$context = new Kit_Context();
		$context->group( Kit_Context::GROUP_POSTS )->put( 11, 202 );
		$context->group( Kit_Context::GROUP_GLOBAL_CLASSES )->put( 'g-old', 'g-new' );

		$this->set_property( $import, 'context', $context );
		$this->set_property( $import, 'imported_data', [
			'templates' => [
				'succeed' => [
					11 => 101,
					12 => 102,
				],
			],
			'taxonomies' => [
				'post' => [
					'category' => [
						[
							'old_id' => 5,
							'new_id' => 50,
						],
					],
				],
			],
		] );

		$replacements = $this->invoke_method( $import, 'get_imported_data_replacements' );

		$this->assertSame( 202, $replacements['post_ids'][11] );
		$this->assertSame( 102, $replacements['post_ids'][12] );
		$this->assertSame( 50, $replacements['term_ids'][5] );
		$this->assertSame( 'g-new', $replacements['class_ids']['g-old'] );
	}

	public function test_save_elements_of_imported_posts__rewrites_variable_and_class_ids_from_context() {
		$import = $this->make_import_process();
		$context = new Kit_Context();
		$context->group( Kit_Context::GROUP_GLOBAL_VARIABLES )->put( 'e-gv-old', 'e-gv-new' );
		$context->group( Kit_Context::GROUP_GLOBAL_CLASSES )->put( 'g-old', 'g-new' );

		$this->set_property( $import, 'context', $context );
		$this->set_property( $import, 'documents_data', [
			123 => [
				'elements' => [
					[
						'id' => 'test-widget',
						'elType' => 'widget',
						'widgetType' => 'heading',
						'settings' => [
							'text_color' => [
								'$$type' => Color_Variable_Prop_Type::get_key(),
								'value' => 'e-gv-old',
							],
							'classes' => [
								'$$type' => 'classes',
								'value' => [ 'g-old' ],
							],
						],
					],
				],
			],
		] );

		$saved = null;
		$document = new class( $saved ) {
			private $saved;

			public function __construct( &$saved ) {
				$this->saved = &$saved;
			}

			public function on_import_update_dynamic_content( array $elements, array $replacements ): array {
				return $elements;
			}

			public function on_import_update_settings( array $settings, array $replacements ): array {
				return $settings;
			}

			public function save( array $data ): void {
				$this->saved = $data;
			}
		};

		$documents_manager = new class( $document ) {
			private $document;

			public function __construct( $document ) {
				$this->document = $document;
			}

			public function get( int $post_id ) {
				return $this->document;
			}
		};

		$this->original_documents_manager = Plugin::$instance->documents;
		Plugin::$instance->documents = $documents_manager;

		$this->invoke_method( $import, 'save_elements_of_imported_posts' );

		$this->assertSame(
			'e-gv-new',
			$saved['elements'][0]['settings']['text_color']['value']
		);
		$this->assertSame(
			[ 'g-new' ],
			$saved['elements'][0]['settings']['classes']['value']
		);
	}

	private function make_import_process(): Import {
		$reflection = new \ReflectionClass( Import::class );
		$import = $reflection->newInstanceWithoutConstructor();

		$this->set_property( $import, 'runners', [] );
		$this->set_property( $import, 'runner_priorities', [] );
		$this->set_property( $import, 'session_id', 'test-session' );
		$this->set_property( $import, 'kit_id', '' );
		$this->set_property( $import, 'adapters', [] );
		$this->set_property( $import, 'documents_data', [] );
		$this->set_property( $import, 'extracted_directory_path', '' );
		$this->set_property( $import, 'manifest', [] );
		$this->set_property( $import, 'site_settings', [] );
		$this->set_property( $import, 'settings_include', [] );
		$this->set_property( $import, 'settings_referrer', 'local' );
		$this->set_property( $import, 'settings_conflicts', [] );
		$this->set_property( $import, 'settings_selected_override_conditions', [] );
		$this->set_property( $import, 'settings_selected_custom_post_types', [] );
		$this->set_property( $import, 'settings_selected_plugins', [] );
		$this->set_property( $import, 'settings_customization', [] );
		$this->set_property( $import, 'imported_data', [] );
		$this->set_property( $import, 'runners_import_metadata', [] );
		$this->set_property( $import, 'context', new Kit_Context() );

		return $import;
	}

	private function set_property( object $object, string $property_name, $value ): void {
		$property = new \ReflectionProperty( $object, $property_name );
		$property->setAccessible( true );
		$property->setValue( $object, $value );
	}

	private function get_property( object $object, string $property_name ) {
		$property = new \ReflectionProperty( $object, $property_name );
		$property->setAccessible( true );

		return $property->getValue( $object );
	}

	private function invoke_method( object $object, string $method_name, array $arguments = [] ) {
		$method = new \ReflectionMethod( $object, $method_name );
		$method->setAccessible( true );

		return $method->invokeArgs( $object, $arguments );
	}
}
