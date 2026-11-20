<?php

namespace Elementor\Testing\Modules\AtomicWidgets\ImportExport;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Sensitivity;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Non_Exportable_Props extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		add_filter( 'elementor/atomic-widgets/props-schema', [ $this, 'add_non_exportable_props' ] );
	}

	public function tearDown(): void {
		remove_filter( 'elementor/atomic-widgets/props-schema', [ $this, 'add_non_exportable_props' ] );

		parent::tearDown();
	}

	public function add_non_exportable_props( array $schema ): array {
		$schema['test_api_key'] = String_Prop_Type::make()->meta( Prop_Sensitivity::sensitive() );
		$schema['test_list_id'] = String_Prop_Type::make()->meta( Prop_Sensitivity::not_exportable() );
		$schema['test_regular'] = String_Prop_Type::make();

		return $schema;
	}

	public function test_on_export__strips_sensitive_and_non_exportable_props_from_atomic_widget() {
		// Arrange.
		$element = Plugin::$instance->elements_manager->create_element_instance(
			$this->make_heading( 'heading1' )
		);

		// Act.
		$exported = $element->on_export( $element->get_data() );

		// Assert.
		$this->assertArrayNotHasKey( 'test_api_key', $exported['settings'] );
		$this->assertArrayNotHasKey( 'test_list_id', $exported['settings'] );
		$this->assertSame( String_Prop_Type::generate( 'kept' ), $exported['settings']['test_regular'] );
		$this->assertSame( String_Prop_Type::generate( 'h3' ), $exported['settings']['tag'] );
	}

	public function test_on_export__strips_props_from_atomic_element() {
		// Arrange.
		$element = Plugin::$instance->elements_manager->create_element_instance(
			$this->make_div_block( 'div1', [] )
		);

		// Act.
		$exported = $element->on_export( $element->get_data() );

		// Assert.
		$this->assertArrayNotHasKey( 'test_api_key', $exported['settings'] );
		$this->assertArrayNotHasKey( 'test_list_id', $exported['settings'] );
		$this->assertSame( String_Prop_Type::generate( 'kept' ), $exported['settings']['test_regular'] );
	}

	public function test_on_export__keeps_element_data_without_settings_untouched() {
		// Arrange.
		$element = Plugin::$instance->elements_manager->create_element_instance(
			$this->make_heading( 'heading1' )
		);

		$data = [
			'id' => 'heading1',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
		];

		// Act.
		$exported = $element->on_export( $data );

		// Assert.
		$this->assertSame( $data, $exported );
	}

	public function test_get_export_data__strips_props_from_nested_atomic_elements() {
		// Arrange.
		$this->act_as_admin();

		$document = $this->factory()->documents->create_and_get();
		$document->save( [
			'elements' => [
				$this->make_div_block( 'div1', [ $this->make_heading( 'heading1' ) ] ),
			],
			'settings' => [],
		] );

		$saved = $document->get_elements_data();
		$this->assertSame( 'secret', $saved[0]['elements'][0]['settings']['test_api_key']['value'] );

		// Act.
		$export = $document->get_export_data();

		// Assert.
		$container = $export['content'][0];
		$heading = $container['elements'][0];

		foreach ( [ $container, $heading ] as $exported_element ) {
			$this->assertArrayNotHasKey( 'test_api_key', $exported_element['settings'] );
			$this->assertArrayNotHasKey( 'test_list_id', $exported_element['settings'] );
			$this->assertSame( 'kept', $exported_element['settings']['test_regular']['value'] );
		}

		$this->assertSame( 'e-heading', $heading['widgetType'] );
	}

	public function test_get_export_data__keeps_props_in_the_document_itself() {
		// Arrange.
		$this->act_as_admin();

		$document = $this->factory()->documents->create_and_get();
		$document->save( [
			'elements' => [ $this->make_heading( 'heading1' ) ],
			'settings' => [],
		] );

		// Act.
		$document->get_export_data();

		// Assert.
		$saved = $document->get_elements_data();
		$this->assertSame( 'secret', $saved[0]['settings']['test_api_key']['value'] );
		$this->assertSame( 'list-1', $saved[0]['settings']['test_list_id']['value'] );
	}

	private function make_heading( string $id ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => $this->make_settings( [
				'tag' => String_Prop_Type::generate( 'h3' ),
			] ),
			'elements' => [],
		];
	}

	private function make_div_block( string $id, array $children ): array {
		return [
			'id' => $id,
			'elType' => 'e-div-block',
			'settings' => $this->make_settings(),
			'elements' => $children,
		];
	}

	private function make_settings( array $extra = [] ): array {
		return array_merge( [
			'test_api_key' => String_Prop_Type::generate( 'secret' ),
			'test_list_id' => String_Prop_Type::generate( 'list-1' ),
			'test_regular' => String_Prop_Type::generate( 'kept' ),
		], $extra );
	}
}
