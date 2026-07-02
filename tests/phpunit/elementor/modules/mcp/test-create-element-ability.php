<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Base\Document;
use Elementor\Core\Documents_Manager;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Elements_Manager;
use Elementor\Modules\Mcp\Abilities\Create_Element_Ability;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Create_Element_Ability extends Elementor_Test_Base {

	private Create_Element_Ability $ability;
	private Documents_Manager $original_documents;
	private Widgets_Manager $original_widgets_manager;
	private Elements_Manager $original_elements_manager;

	public function setUp(): void {
		parent::setUp();

		$this->original_documents       = Plugin::$instance->documents;
		$this->original_widgets_manager = Plugin::$instance->widgets_manager;
		$this->original_elements_manager = Plugin::$instance->elements_manager;

		$this->ability = new Create_Element_Ability( $this->make_noop_mutator() );
	}

	public function tearDown(): void {
		Plugin::$instance->documents        = $this->original_documents;
		Plugin::$instance->widgets_manager  = $this->original_widgets_manager;
		Plugin::$instance->elements_manager = $this->original_elements_manager;
		parent::tearDown();
	}

	// Schema

	public function test_element_input_schema_rejects_elements_key_via_additional_properties_false() {
		// Arrange
		$ability = new Create_Element_Ability();
		$ref     = new \ReflectionMethod( $ability, 'get_definition' );
		$ref->setAccessible( true );
		$definition = $ref->invoke( $ability );
		$schema     = $definition->to_array();

		// Act
		$element_schema = $schema['input_schema']['properties']['element'] ?? [];

		// Assert — additionalProperties: false prevents an 'elements' key from slipping in
		$this->assertSame( false, $element_schema['additionalProperties'] ?? null );
	}

	// execute() — type resolution

	public function test_execute__returns_400_for_unknown_element_type() {
		// Arrange
		$this->act_as_admin();
		$this->stub_type_registries_with_nothing();

		// Act
		$result = $this->ability->execute( [
			'post_id' => 999,
			'element' => [ 'type' => 'nonexistent-type' ],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_unknown_type', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_for_nonexistent_post() {
		// Arrange
		$this->act_as_admin();
		$this->stub_type_registries_with_widget_type( 'e-heading' );
		$this->stub_documents_returning( null );

		// Act
		$result = $this->ability->execute( [
			'post_id' => 999999,
			'element' => [ 'type' => 'e-heading' ],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	// execute() — draft-save

	public function test_execute__sets_published_post_to_draft_before_save() {
		// Arrange
		$this->act_as_admin();
		$this->stub_type_registries_with_widget_type( 'e-heading' );

		$post_id      = $this->factory()->post->create( [ 'post_status' => 'publish', 'post_type' => 'page' ] );
		$captured_status_before_save = null;

		$mock_document = $this->createMock( Document::class );
		$mock_document->method( 'get_elements_data' )->willReturn( [] );
		$mock_document->method( 'get_main_id' )->willReturn( $post_id );
		$mock_document->method( 'get_preview_url' )->willReturn( 'https://example.com/?p=' . $post_id );
		$mock_document->method( 'save' )->willReturnCallback( function () use ( $post_id, &$captured_status_before_save ) {
			$captured_status_before_save = get_post_status( $post_id );
			return true;
		} );

		$this->stub_documents_returning( $mock_document );
		$ability = new Create_Element_Ability( $this->make_noop_mutator() );

		// Act
		$ability->execute( [
			'post_id' => $post_id,
			'element' => [ 'type' => 'e-heading' ],
		] );

		// Assert — post was set to draft before Document::save() was called
		$this->assertSame( 'draft', $captured_status_before_save );
	}

	public function test_execute__saves_draft_post_in_place_without_status_change() {
		// Arrange
		$this->act_as_admin();
		$this->stub_type_registries_with_widget_type( 'e-heading' );

		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->createMock( Document::class );
		$mock_document->method( 'get_elements_data' )->willReturn( [] );
		$mock_document->method( 'get_main_id' )->willReturn( $post_id );
		$mock_document->method( 'get_preview_url' )->willReturn( 'https://example.com/?p=' . $post_id );
		$mock_document->method( 'save' )->willReturn( true );

		$this->stub_documents_returning( $mock_document );
		$ability = new Create_Element_Ability( $this->make_noop_mutator() );

		// Act
		$ability->execute( [
			'post_id' => $post_id,
			'element' => [ 'type' => 'e-heading' ],
		] );

		// Assert — draft post status unchanged
		$this->assertSame( 'draft', get_post_status( $post_id ) );
	}

	// execute() — success response shape

	public function test_execute__returns_success_response_with_required_fields() {
		// Arrange
		$this->act_as_admin();
		$this->stub_type_registries_with_widget_type( 'e-heading' );

		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->createMock( Document::class );
		$mock_document->method( 'get_elements_data' )->willReturn( [] );
		$mock_document->method( 'get_main_id' )->willReturn( $post_id );
		$mock_document->method( 'get_preview_url' )->willReturn( 'https://example.com/?p=' . $post_id . '&preview=1' );
		$mock_document->method( 'save' )->willReturn( true );

		$this->stub_documents_returning( $mock_document );
		$ability = new Create_Element_Ability( $this->make_noop_mutator() );

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'element' => [ 'type' => 'e-heading' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
		$this->assertSame( $post_id, $result['post_id'] );
		$this->assertArrayHasKey( 'element_id', $result );
		$this->assertNotEmpty( $result['element_id'] );
		$this->assertArrayHasKey( 'version', $result );
		$this->assertArrayHasKey( 'preview_url', $result );
	}

	// execute() — insert_at validation errors surface as HTTP 400

	public function test_execute__surfaces_invalid_parent_error_from_mutator() {
		// Arrange
		$this->act_as_admin();
		$this->stub_type_registries_with_widget_type( 'e-heading' );

		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->createMock( Document::class );
		$mock_document->method( 'get_elements_data' )->willReturn( [] );
		$mock_document->method( 'get_main_id' )->willReturn( $post_id );

		$this->stub_documents_returning( $mock_document );

		$mutator_error = new \WP_Error( 'elementor_invalid_parent', 'Bad parent', [ 'status' => \WP_Http::BAD_REQUEST ] );
		$mock_mutator  = $this->createMock( Document_Mutator::class );
		$mock_mutator->method( 'insert_at' )->willReturn( $mutator_error );

		$ability = new Create_Element_Ability( $mock_mutator );

		// Act
		$result = $ability->execute( [
			'post_id'   => $post_id,
			'parent_id' => 'nonexistent-parent',
			'element'   => [ 'type' => 'e-heading' ],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_parent', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	// Helpers

	private function make_noop_mutator(): Document_Mutator {
		$mock = $this->createMock( Document_Mutator::class );
		$mock->method( 'insert_at' )->willReturnArgument( 0 );
		return $mock;
	}

	private function stub_documents_returning( ?Document $document ): void {
		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $document );
		Plugin::$instance->documents = $mock_docs;
	}

	private function stub_type_registries_with_nothing(): void {
		$mock_widgets  = $this->createMock( Widgets_Manager::class );
		$mock_widgets->method( 'get_widget_types' )->willReturn( null );
		Plugin::$instance->widgets_manager = $mock_widgets;

		$mock_elements = $this->createMock( Elements_Manager::class );
		$mock_elements->method( 'get_element_types' )->willReturn( null );
		Plugin::$instance->elements_manager = $mock_elements;
	}

	private function stub_type_registries_with_widget_type( string $type ): void {
		$mock_widget = $this->createMock( \Elementor\Widget_Base::class );

		$mock_widgets = $this->createMock( Widgets_Manager::class );
		$mock_widgets->method( 'get_widget_types' )
			->with( $type )
			->willReturn( $mock_widget );
		Plugin::$instance->widgets_manager = $mock_widgets;

		$mock_elements = $this->createMock( Elements_Manager::class );
		$mock_elements->method( 'get_element_types' )->willReturn( null );
		Plugin::$instance->elements_manager = $mock_elements;
	}
}
