<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Circular_Dependency_Validator;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Circular_Dependency_Validator extends Elementor_Test_Base {
	const COMPONENT_WIDGET_TYPE = 'e-component';

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
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->clean_up_components();
	}

	private function clean_up_components() {
		$components = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}
	}

	public function test_validate__returns_success_when_no_components_referenced() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Test Component', [] );
		$validator = Circular_Dependency_Validator::make();

		$elements = [
			[
				'id' => 'element-1',
				'elType' => 'widget',
				'widgetType' => 'e-button',
				'settings' => [],
				'elements' => [],
			],
		];

		// Act
		$result = $validator->validate( $component_id, $elements );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate__returns_success_when_referencing_unrelated_component() {
		// Arrange
		$this->act_as_admin();
		$component_a_id = $this->create_test_component( 'Component A', [] );
		$component_b_id = $this->create_test_component( 'Component B', [] );
		$validator = Circular_Dependency_Validator::make();

		$elements = [
			$this->create_component_element( $component_b_id ),
		];

		// Act
		$result = $validator->validate( $component_a_id, $elements );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate__detects_direct_self_reference() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Self Referencing Component', [] );
		$validator = Circular_Dependency_Validator::make();

		$elements = [
			$this->create_component_element( $component_id ),
		];

		// Act
		$result = $validator->validate( $component_id, $elements );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertNotEmpty( $result['messages'] );
		$this->assertStringContainsString( 'Circular dependency', $result['messages'][0] );
	}

	public function test_validate__detects_indirect_circular_reference() {
		// Arrange
		$this->act_as_admin();

		$component_a_id = $this->create_test_component( 'Component A', [] );

		$component_b_elements = [
			$this->create_component_element( $component_a_id ),
		];
		$component_b_id = $this->create_test_component( 'Component B', $component_b_elements );

		$validator = Circular_Dependency_Validator::make();

		$elements_for_a = [
			$this->create_component_element( $component_b_id ),
		];

		// Act
		$result = $validator->validate( $component_a_id, $elements_for_a );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertNotEmpty( $result['messages'] );
		$this->assertStringContainsString( 'Circular dependency', $result['messages'][0] );
	}

	public function test_validate__detects_deeply_nested_circular_reference() {
		// Arrange
		$this->act_as_admin();

		$component_a_id = $this->create_test_component( 'Component A', [] );

		$component_b_elements = [ $this->create_component_element( $component_a_id ) ];
		$component_b_id = $this->create_test_component( 'Component B', $component_b_elements );

		$component_c_elements = [ $this->create_component_element( $component_b_id ) ];
		$component_c_id = $this->create_test_component( 'Component C', $component_c_elements );

		$component_d_elements = [ $this->create_component_element( $component_c_id ) ];
		$component_d_id = $this->create_test_component( 'Component D', $component_d_elements );

		$validator = Circular_Dependency_Validator::make();

		$elements_for_a = [
			$this->create_component_element( $component_d_id ),
		];

		// Act
		$result = $validator->validate( $component_a_id, $elements_for_a );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertNotEmpty( $result['messages'] );
		$this->assertStringContainsString( 'Circular dependency', $result['messages'][0] );
	}

	public function test_validate__allows_valid_component_chain() {
		// Arrange
		$this->act_as_admin();

		$component_d_id = $this->create_test_component( 'Component D', [] );

		$component_c_elements = [ $this->create_component_element( $component_d_id ) ];
		$component_c_id = $this->create_test_component( 'Component C', $component_c_elements );

		$component_b_elements = [ $this->create_component_element( $component_c_id ) ];
		$component_b_id = $this->create_test_component( 'Component B', $component_b_elements );

		$component_a_id = $this->create_test_component( 'Component A', [] );

		$validator = Circular_Dependency_Validator::make();

		$elements_for_a = [
			$this->create_component_element( $component_b_id ),
		];

		// Act
		$result = $validator->validate( $component_a_id, $elements_for_a );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate__detects_circular_reference_in_nested_elements() {
		// Arrange
		$this->act_as_admin();

		$component_a_id = $this->create_test_component( 'Component A', [] );
		$component_b_elements = [ $this->create_component_element( $component_a_id ) ];
		$component_b_id = $this->create_test_component( 'Component B', $component_b_elements );

		$validator = Circular_Dependency_Validator::make();

		$elements_for_a = [
			[
				'id' => 'container-1',
				'elType' => 'container',
				'settings' => [],
				'elements' => [
					[
						'id' => 'inner-container',
						'elType' => 'container',
						'settings' => [],
						'elements' => [
							$this->create_component_element( $component_b_id ),
						],
					],
				],
			],
		];

		// Act
		$result = $validator->validate( $component_a_id, $elements_for_a );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertStringContainsString( 'Circular dependency', $result['messages'][0] );
	}

	public function test_validate_new_components__returns_success_for_valid_components() {
		// Arrange
		$validator = Circular_Dependency_Validator::make();
		$items = Collection::make( [
			[
				'uid' => 'component-1',
				'elements' => [
					[
						'id' => 'element-1',
						'elType' => 'widget',
						'widgetType' => 'e-button',
						'settings' => [],
					],
				],
			],
			[
				'uid' => 'component-2',
				'elements' => [
					[
						'id' => 'element-2',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'settings' => [],
					],
				],
			],
		] );

		// Act
		$result = $validator->validate_new_components( $items );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate_new_components__detects_self_reference_in_new_component() {
		// Arrange
		$validator = Circular_Dependency_Validator::make();
		$items = Collection::make( [
			[
				'uid' => 'component-self-ref',
				'elements' => [
					$this->create_component_element_with_uid( 'component-self-ref' ),
				],
			],
		] );

		// Act
		$result = $validator->validate_new_components( $items );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertStringContainsString( 'Circular dependency', $result['messages'][0] );
		$this->assertStringContainsString( 'component-self-ref', $result['messages'][0] );
	}

	public function test_validate_new_components__detects_circular_reference_between_new_components() {
		// Arrange
		$validator = Circular_Dependency_Validator::make();
		$items = Collection::make( [
			[
				'uid' => 'component-a',
				'elements' => [
					$this->create_component_element_with_uid( 'component-b' ),
				],
			],
			[
				'uid' => 'component-b',
				'elements' => [
					$this->create_component_element_with_uid( 'component-a' ),
				],
			],
		] );

		// Act
		$result = $validator->validate_new_components( $items );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertStringContainsString( 'Circular dependency', $result['messages'][0] );
	}

	public function test_validate_new_components__allows_valid_chain_in_new_components() {
		// Arrange
		$validator = Circular_Dependency_Validator::make();
		$items = Collection::make( [
			[
				'uid' => 'component-a',
				'elements' => [
					$this->create_component_element_with_uid( 'component-b' ),
				],
			],
			[
				'uid' => 'component-b',
				'elements' => [
					$this->create_component_element_with_uid( 'component-c' ),
				],
			],
			[
				'uid' => 'component-c',
				'elements' => [
					[
						'id' => 'element-1',
						'elType' => 'widget',
						'widgetType' => 'e-button',
						'settings' => [],
					],
				],
			],
		] );

		// Act
		$result = $validator->validate_new_components( $items );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEmpty( $result['messages'] );
	}

	private function create_test_component( string $name, array $content ): int {
		$this->act_as_admin();
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => $name,
				'post_status' => 'publish',
			]
		);

		$document->save( [
			'elements' => $content,
		] );

		return $document->get_main_id();
	}

	private function create_component_element( int $component_id ): array {
		return [
			'id' => 'component-instance-' . $component_id,
			'elType' => 'widget',
			'widgetType' => self::COMPONENT_WIDGET_TYPE,
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
			'elements' => [],
		];
	}

	private function create_component_element_with_uid( string $component_uid ): array {
		return [
			'id' => 'component-instance-' . $component_uid,
			'elType' => 'widget',
			'widgetType' => self::COMPONENT_WIDGET_TYPE,
			'settings' => [
				'component_instance' => [
					'$$type' => 'component-instance',
					'value' => [
						'component_id' => [
							'$$type' => 'string',
							'value' => $component_uid,
						],
					],
				],
			],
			'elements' => [],
		];
	}
}

