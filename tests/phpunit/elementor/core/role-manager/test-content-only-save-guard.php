<?php

namespace Elementor\Testing\Core\RoleManager;

use Elementor\Core\Base\Document;
use Elementor\Core\RoleManager\Content_Only_Save_Guard;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Content_Only_Save_Guard extends Elementor_Test_Base {

	private Content_Only_Save_Guard $guard;

	private $original_role_manager = null;

	public function setUp(): void {
		parent::setUp();

		$this->guard = new Content_Only_Save_Guard();
	}

	public function tearDown(): void {
		if ( $this->original_role_manager ) {
			Plugin::$instance->role_manager = $this->original_role_manager;
			$this->original_role_manager = null;
		}

		parent::tearDown();
	}

	public function test_filter_save_data__restores_persisted_design_fields_for_existing_elements() {
		// Arrange
		$this->mock_user_can_design( false );

		$persisted_styles = [ 'id' => 'style-1', 'type' => 'class' ];
		$persisted_interactions = [ 'items' => [ [ 'id' => 'interaction-1' ] ], 'version' => 1 ];
		$persisted_classes = [ '$$type' => 'classes', 'value' => [ 'my-class' ] ];

		$persisted_element = $this->make_element(
			'heading-1',
			[
				'styles' => $persisted_styles,
				'interactions' => $persisted_interactions,
				'settings' => [
					'title' => [ '$$type' => 'string', 'value' => 'Persisted title' ],
					'classes' => $persisted_classes,
				],
			]
		);

		$incoming_element = $this->make_element(
			'heading-1',
			[
				'styles' => [ 'id' => 'style-2', 'type' => 'class' ],
				'interactions' => [ 'items' => [ [ 'id' => 'interaction-2' ] ], 'version' => 1 ],
				'settings' => [
					'title' => [ '$$type' => 'string', 'value' => 'Incoming title' ],
					'classes' => [ '$$type' => 'classes', 'value' => [ 'tampered-class' ] ],
				],
			]
		);

		$document = $this->create_document_mock( [ $persisted_element ] );
		$data = [ 'elements' => [ $incoming_element ] ];

		// Act
		$result = $this->guard->filter_save_data( $data, $document );

		// Assert
		$saved_element = $result['elements'][0];

		$this->assertSame( $persisted_styles, $saved_element['styles'] );
		$this->assertSame( $persisted_interactions, $saved_element['interactions'] );
		$this->assertSame( $persisted_classes, $saved_element['settings']['classes'] );
		$this->assertSame( 'Incoming title', $saved_element['settings']['title']['value'] );
	}

	public function test_filter_save_data__strips_design_fields_from_new_elements() {
		// Arrange
		$this->mock_user_can_design( false );

		$new_element = $this->make_element(
			'heading-new',
			[
				'styles' => [ 'id' => 'style-new' ],
				'interactions' => [ 'items' => [ [ 'id' => 'interaction-new' ] ], 'version' => 1 ],
				'settings' => [
					'title' => [ '$$type' => 'string', 'value' => 'New heading' ],
					'classes' => [ '$$type' => 'classes', 'value' => [ 'new-class' ] ],
				],
			]
		);

		$document = $this->create_document_mock( [] );
		$data = [ 'elements' => [ $new_element ] ];

		// Act
		$result = $this->guard->filter_save_data( $data, $document );

		// Assert
		$saved_element = $result['elements'][0];

		$this->assertArrayNotHasKey( 'styles', $saved_element );
		$this->assertArrayNotHasKey( 'interactions', $saved_element );
		$this->assertArrayNotHasKey( 'classes', $saved_element['settings'] );
		$this->assertSame( 'New heading', $saved_element['settings']['title']['value'] );
	}

	public function test_filter_save_data__preserves_non_design_settings_for_restricted_users() {
		// Arrange
		$this->mock_user_can_design( false );

		$persisted_element = $this->make_element(
			'heading-1',
			[
				'settings' => [
					'title' => [ '$$type' => 'string', 'value' => 'Old title' ],
				],
			]
		);

		$incoming_element = $this->make_element(
			'heading-1',
			[
				'settings' => [
					'title' => [ '$$type' => 'string', 'value' => 'Updated title' ],
					'link' => [ '$$type' => 'link', 'value' => [ 'url' => 'https://example.com' ] ],
				],
			]
		);

		$document = $this->create_document_mock( [ $persisted_element ] );
		$data = [ 'elements' => [ $incoming_element ] ];

		// Act
		$result = $this->guard->filter_save_data( $data, $document );

		// Assert
		$saved_element = $result['elements'][0 ];

		$this->assertSame( 'Updated title', $saved_element['settings']['title']['value'] );
		$this->assertSame( 'https://example.com', $saved_element['settings']['link']['value']['url'] );
	}

	public function test_filter_save_data__does_not_change_data_for_unrestricted_users() {
		// Arrange
		$this->mock_user_can_design( true );

		$incoming_element = $this->make_element(
			'heading-1',
			[
				'styles' => [ 'id' => 'style-1' ],
				'interactions' => [ 'items' => [], 'version' => 1 ],
				'settings' => [
					'title' => [ '$$type' => 'string', 'value' => 'Title' ],
					'classes' => [ '$$type' => 'classes', 'value' => [ 'my-class' ] ],
				],
			]
		);

		$document = $this->create_document_mock( [] );
		$data = [ 'elements' => [ $incoming_element ] ];

		// Act
		$result = $this->guard->filter_save_data( $data, $document );

		// Assert
		$this->assertSame( $data, $result );
	}

	public function test_filter_save_data__handles_nested_elements_recursively() {
		// Arrange
		$this->mock_user_can_design( false );

		$persisted_child = $this->make_element(
			'child-1',
			[
				'styles' => [ 'id' => 'child-style' ],
				'interactions' => [ 'items' => [ [ 'id' => 'child-interaction' ] ], 'version' => 1 ],
				'settings' => [
					'classes' => [ '$$type' => 'classes', 'value' => [ 'child-class' ] ],
				],
			]
		);

		$persisted_container = $this->make_element(
			'container-1',
			[
				'elType' => 'container',
				'widgetType' => null,
				'elements' => [ $persisted_child ],
			]
		);

		$incoming_child = $this->make_element(
			'child-1',
			[
				'styles' => [ 'id' => 'tampered-style' ],
				'interactions' => [ 'items' => [ [ 'id' => 'tampered-interaction' ] ], 'version' => 1 ],
				'settings' => [
					'classes' => [ '$$type' => 'classes', 'value' => [ 'tampered-class' ] ],
				],
			]
		);

		$incoming_container = $this->make_element(
			'container-1',
			[
				'elType' => 'container',
				'widgetType' => null,
				'elements' => [ $incoming_child ],
			]
		);

		$document = $this->create_document_mock( [ $persisted_container ] );
		$data = [ 'elements' => [ $incoming_container ] ];

		// Act
		$result = $this->guard->filter_save_data( $data, $document );

		// Assert
		$saved_child = $result['elements'][0]['elements'][0];

		$this->assertSame( $persisted_child['styles'], $saved_child['styles'] );
		$this->assertSame( $persisted_child['interactions'], $saved_child['interactions'] );
		$this->assertSame( $persisted_child['settings']['classes'], $saved_child['settings']['classes'] );
	}

	private function mock_user_can_design( bool $can_design ): void {
		$role_manager = $this->getMockBuilder( Role_Manager::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'user_can' ] )
			->getMock();

		$role_manager->method( 'user_can' )
			->with( 'design' )
			->willReturn( $can_design );

		$this->original_role_manager = Plugin::$instance->role_manager;
		Plugin::$instance->role_manager = $role_manager;
	}

	private function create_document_mock( array $persisted_elements, int $document_id = 123 ): Document {
		$document = $this->getMockBuilder( Document::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'get_elements_data', 'get_main_id' ] )
			->getMock();

		$document->method( 'get_elements_data' )->willReturn( $persisted_elements );
		$document->method( 'get_main_id' )->willReturn( $document_id );

		return $document;
	}

	private function make_element( string $id, array $overrides = [] ): array {
		return array_merge(
			[
				'id' => $id,
				'elType' => 'widget',
				'widgetType' => 'atomic-heading',
				'settings' => [],
				'elements' => [],
			],
			$overrides
		);
	}
}
