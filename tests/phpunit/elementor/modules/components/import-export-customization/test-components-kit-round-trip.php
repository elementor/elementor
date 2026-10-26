<?php

namespace Elementor\Testing\Modules\Components\ImportExportCustomization;

use Elementor\App\Modules\ImportExportCustomization\Processes\Import;
use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Elementor_Content;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Import as Components_Import_Runner;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Plugin;
use Elementor\Testing\Modules\Components\Mocks\Nested_Components_Mocks;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../mocks/nested-components/nested-components-mocks.php';
require_once __DIR__ . '/../mocks/mock-pro-license-api.php';

/**
 * @group components-import-export
 */
class Test_Components_Kit_Round_Trip extends Elementor_Test_Base {
	const PAGE_DOC_TYPE = 'wp-page';
	const OVERRIDE_KEY = 'prop-0';
	const OVERRIDE_TEXT = 'New button text';
	const SOURCE_BUTTON_ELEMENT_ID = '07ac447';
	const MOCK_BUTTON_COMPONENT_ID = 1111;
	const CARD_EXPOSED_BUTTON_KEY = 'prop-4';

	private string $kit_directory = '';

	public function setUp(): void {
		parent::setUp();

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

		\Mock_Pro_License_API::set_license_state( true );
	}

	public function tearDown(): void {
		if ( $this->kit_directory && is_dir( $this->kit_directory ) ) {
			Plugin::$instance->uploads_manager->remove_file_or_dir( $this->kit_directory );
		}

		foreach ( get_posts( [ 'post_type' => Component_Document::TYPE, 'post_status' => 'any', 'posts_per_page' => -1 ] ) as $post ) {
			wp_delete_post( $post->ID, true );
		}

		parent::tearDown();
	}

	public function test_round_trip__keeps_overridable_props_and_page_overrides() {
		// Arrange
		$this->act_as_admin();

		$source_component_id = $this->create_source_component();
		$source_page_id = $this->create_source_page( $source_component_id );

		$component_export = Plugin::$instance->documents->get( $source_component_id, false )->get_export_data();
		$page_export = Plugin::$instance->documents->get( $source_page_id, false )->get_export_data();

		$this->assertCount( 2, $component_export['settings']['overridable_props']['props'] ?? [], 'Export: component settings must carry overridable_props.' );
		$this->assertSame( self::SOURCE_BUTTON_ELEMENT_ID, $this->find_widget_id( $component_export['content'], 'e-button' ), 'Export: component element ids must be kept.' );
		$this->assertSame( $source_component_id, $component_export['settings'][ Component_Document::EXPORT_SETTINGS_SOURCE_ID_KEY ] ?? null, 'Export: component settings must carry the source id.' );
		$this->assertNotEmpty( $this->find_override( $page_export['content'], self::OVERRIDE_KEY ), 'Export: page instance must carry the override.' );

		$this->write_kit( $source_component_id, $component_export, $source_page_id, $page_export );

		wp_delete_post( $source_page_id, true );
		wp_delete_post( $source_component_id, true );

		// Act
		$import = new Import( $this->kit_directory, [ 'include' => [ 'content' ] ] );
		$import->register( new Components_Import_Runner(), Import::PRIORITY_COMPONENTS );
		$import->register( new Elementor_Content() );
		$result = $import->run();

		// Assert
		$target_component_id = (int) ( $result['content'][ Component_Document::TYPE ]['succeed'][ $source_component_id ] ?? 0 );
		$target_page_id = (int) ( $result['content']['page']['succeed'][ $source_page_id ] ?? 0 );

		$this->assertGreaterThan( 0, $target_component_id, 'Import: component must succeed. Result: ' . wp_json_encode( $result ) );
		$this->assertGreaterThan( 0, $target_page_id, 'Import: page must succeed. Result: ' . wp_json_encode( $result ) );

		/** @var Component_Document $target_component */
		$target_component = Plugin::$instance->documents->get( $target_component_id, false );
		$target_props = $target_component->get_overridable_props()->to_associative_array()['props'];

		$this->assertSame( [ 'prop-0', 'prop-1' ], array_keys( $target_props ), 'Target: component overridable_props meta must be rebuilt.' );
		$target_button_id = $this->find_widget_id( $target_component->get_elements_data(), 'e-button' );

		$this->assertNotSame( self::SOURCE_BUTTON_ELEMENT_ID, $target_button_id, 'Target: component element ids must be regenerated on import.' );
		$this->assertSame(
			$target_button_id,
			$target_props[ self::OVERRIDE_KEY ]['elementId'],
			'Target: overridable prop elementId must point at the imported inner element.'
		);

		$target_instance = $this->find_instance( Plugin::$instance->documents->get( $target_page_id, false )->get_elements_data() );

		$this->assertNotNull( $target_instance, 'Target: page must keep the component instance.' );
		$this->assertSame( $target_component_id, (int) Component_Instance_Prop_Type::extract_component_id( $target_instance['settings'] ), 'Target: instance component_id must be remapped.' );

		$target_override = $this->find_override( [ $target_instance ], self::OVERRIDE_KEY );

		$this->assertNotEmpty( $target_override, 'Target: page override must survive the final save.' );
		$this->assertSame( $target_component_id, (int) $target_override['schema_source']['id'], 'Target: override schema_source.id must be remapped.' );
		$this->assertSame( self::OVERRIDE_TEXT, $target_override['override_value']['value'] ?? null, 'Target: override value must be kept.' );
	}

	public function test_round_trip__remaps_nested_exposed_prop_origin_element_id() {
		// Arrange
		$this->act_as_admin();

		$source_button_id = $this->create_source_component();
		$source_card_id = $this->create_source_card_component( $source_button_id );

		$button_export = Plugin::$instance->documents->get( $source_button_id, false )->get_export_data();
		$card_export = Plugin::$instance->documents->get( $source_card_id, false )->get_export_data();

		$this->write_components_kit( [
			$source_button_id => [ 'title' => 'Button Component', 'export' => $button_export, 'depends_on' => [] ],
			$source_card_id => [ 'title' => 'Card Component', 'export' => $card_export, 'depends_on' => [ $source_button_id ] ],
		] );

		wp_delete_post( $source_card_id, true );
		wp_delete_post( $source_button_id, true );

		// Act
		$import = new Import( $this->kit_directory, [ 'include' => [ 'content' ] ] );
		$import->register( new Components_Import_Runner(), Import::PRIORITY_COMPONENTS );
		$result = $import->run();

		// Assert
		$succeeded = $result['content'][ Component_Document::TYPE ]['succeed'] ?? [];

		$this->assertArrayHasKey( $source_button_id, $succeeded, 'Import: button component must succeed. Result: ' . wp_json_encode( $result ) );
		$this->assertArrayHasKey( $source_card_id, $succeeded, 'Import: card component must succeed. Result: ' . wp_json_encode( $result ) );

		/** @var Component_Document $target_button */
		$target_button = Plugin::$instance->documents->get( (int) $succeeded[ $source_button_id ], false );
		/** @var Component_Document $target_card */
		$target_card = Plugin::$instance->documents->get( (int) $succeeded[ $source_card_id ], false );

		$target_inner_button_id = $this->find_widget_id( $target_button->get_elements_data(), 'e-button' );
		$target_card_instance = $this->find_instance( $target_card->get_elements_data() );
		$exposed_prop = $target_card->get_overridable_props()->to_associative_array()['props'][ self::CARD_EXPOSED_BUTTON_KEY ];

		$this->assertSame( $target_card_instance['id'], $exposed_prop['elementId'], 'Target: exposed prop elementId must point at the imported nested instance.' );
		$this->assertSame( $target_inner_button_id, $exposed_prop['originPropFields']['elementId'], 'Target: originPropFields.elementId must point at the imported nested component element.' );
	}

	private function create_source_component(): int {
		$data = Nested_Components_Mocks::get_button_component_data();

		return $this->create_component( 'Button Component', $data['elements'], $data['overridable_props'] );
	}

	private function create_source_card_component( int $button_component_id ): int {
		$data = Nested_Components_Mocks::get_card_component_data();
		$elements = $this->replace_mock_button_component_id( $data['elements'], $button_component_id );
		$overridable_props = $this->replace_mock_button_component_id( $data['overridable_props'], $button_component_id );

		return $this->create_component( 'Card Component', $elements, $overridable_props );
	}

	private function replace_mock_button_component_id( array $data, int $button_component_id ): array {
		$json = str_replace( ':' . self::MOCK_BUTTON_COMPONENT_ID, ':' . $button_component_id, wp_json_encode( $data ) );

		return json_decode( $json, true );
	}

	private function create_component( string $title, array $elements, array $overridable_props ): int {
		$document = Plugin::$instance->documents->create(
			Component_Document::TYPE,
			[
				'post_title' => $title,
				'post_status' => 'publish',
			]
		);

		$document->save( [
			'elements' => $elements,
			'settings' => [ 'overridable_props' => $overridable_props ],
		] );

		return $document->get_main_id();
	}

	private function write_components_kit( array $components ): void {
		$this->kit_directory = Plugin::$instance->uploads_manager->get_temp_dir() . uniqid( 'components-round-trip-' );

		wp_mkdir_p( $this->kit_directory . '/content/' . Component_Document::TYPE );

		$manifest_components = [];
		$dependencies = [];

		foreach ( $components as $component_id => $component ) {
			$manifest_components[ $component_id ] = $this->manifest_entry( $component['title'], Component_Document::TYPE );
			$dependencies[ $component_id ] = [ 'depends_on' => $component['depends_on'] ];

			$this->write_json( 'content/' . Component_Document::TYPE . '/' . $component_id, $component['export'] );
		}

		$this->write_json( 'manifest', [
			'title' => 'components-round-trip',
			'name' => 'components-round-trip',
			'content' => [
				Component_Document::TYPE => $manifest_components,
			],
		] );
		$this->write_json( 'content/' . Component_Document::TYPE . '/dependencies', [ 'dependencies' => $dependencies ] );
	}

	private function create_source_page( int $component_id ): int {
		$document = Plugin::$instance->documents->create(
			self::PAGE_DOC_TYPE,
			[
				'post_title' => 'Page With Component',
				'post_status' => 'publish',
			]
		);

		$document->save( [
			'elements' => [
				[
					'id' => 'a1b2c3d',
					'elType' => 'widget',
					'widgetType' => Component_Instance_Prop_Type::WIDGET_TYPE,
					'elements' => [],
					'styles' => [],
					'settings' => [
						'component_instance' => [
							'$$type' => 'component-instance',
							'value' => [
								'component_id' => [
									'$$type' => 'number',
									'value' => $component_id,
								],
								'overrides' => [
									'$$type' => 'overrides',
									'value' => [
										[
											'$$type' => 'override',
											'value' => [
												'override_key' => self::OVERRIDE_KEY,
												'override_value' => [
													'$$type' => 'escaped-html',
													'value' => self::OVERRIDE_TEXT,
												],
												'schema_source' => [
													'type' => 'component',
													'id' => $component_id,
												],
											],
										],
									],
								],
							],
						],
					],
				],
			],
		] );

		return $document->get_main_id();
	}

	private function write_kit( int $component_id, array $component_export, int $page_id, array $page_export ): void {
		$this->kit_directory = Plugin::$instance->uploads_manager->get_temp_dir() . uniqid( 'components-round-trip-' );

		wp_mkdir_p( $this->kit_directory . '/content/' . Component_Document::TYPE );
		wp_mkdir_p( $this->kit_directory . '/content/page' );

		$manifest = [
			'title' => 'components-round-trip',
			'name' => 'components-round-trip',
			'content' => [
				Component_Document::TYPE => [
					$component_id => $this->manifest_entry( 'Button Component', Component_Document::TYPE ),
				],
				'page' => [
					$page_id => $this->manifest_entry( 'Page With Component', self::PAGE_DOC_TYPE ),
				],
			],
		];

		$this->write_json( 'manifest', $manifest );
		$this->write_json( 'content/' . Component_Document::TYPE . '/' . $component_id, $component_export );
		$this->write_json( 'content/' . Component_Document::TYPE . '/dependencies', [ 'dependencies' => [ $component_id => [ 'depends_on' => [] ] ] ] );
		$this->write_json( 'content/page/' . $page_id, $page_export );
	}

	private function manifest_entry( string $title, string $doc_type ): array {
		return [
			'title' => $title,
			'excerpt' => '',
			'doc_type' => $doc_type,
			'thumbnail' => false,
			'url' => '',
			'terms' => [],
		];
	}

	private function write_json( string $relative_path, array $data ): void {
		file_put_contents( $this->kit_directory . '/' . $relative_path . '.json', wp_json_encode( $data ) );
	}

	private function find_instance( array $elements ): ?array {
		foreach ( $elements as $element ) {
			if ( Component_Instance_Prop_Type::is_instance_element( $element ) ) {
				return $element;
			}

			$found = $this->find_instance( $element['elements'] ?? [] );

			if ( $found ) {
				return $found;
			}
		}

		return null;
	}

	private function find_override( array $elements, string $override_key ): ?array {
		$instance = $this->find_instance( $elements );

		foreach ( $instance['settings']['component_instance']['value']['overrides']['value'] ?? [] as $item ) {
			if ( ( $item['value']['override_key'] ?? null ) === $override_key ) {
				return $item['value'];
			}
		}

		return null;
	}

	private function find_widget_id( array $elements, string $widget_type ): ?string {
		foreach ( $elements as $element ) {
			if ( ( $element['widgetType'] ?? null ) === $widget_type ) {
				return $element['id'];
			}

			$found = $this->find_widget_id( $element['elements'] ?? [], $widget_type );

			if ( $found ) {
				return $found;
			}
		}

		return null;
	}
}
