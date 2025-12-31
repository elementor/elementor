<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Non_Atomic_Widget_Validator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Non_Atomic_Widget_Validator extends Elementor_Test_Base {
	const ATOMIC_WIDGET_TYPE = 'e-heading';
	const NON_ATOMIC_WIDGET_TYPE = 'heading';
	const ATOMIC_CONTAINER_TYPE = 'e-div-block';
	const NON_ATOMIC_CONTAINER_TYPE = 'container';

	public function test_validate__returns_success_for_empty_elements() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();

		// Act
		$result = $validator->validate( [] );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate__returns_success_for_atomic_widgets_only() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$elements = [
			$this->create_widget_element( self::ATOMIC_WIDGET_TYPE ),
		];

		// Act
		$result = $validator->validate( $elements );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate__returns_success_for_atomic_containers_only() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$elements = [
			$this->create_container_element( self::ATOMIC_CONTAINER_TYPE ),
		];

		// Act
		$result = $validator->validate( $elements );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate__detects_non_atomic_container_at_root() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$elements = [
			$this->create_container_element( self::NON_ATOMIC_CONTAINER_TYPE ),
		];

		// Act
		$result = $validator->validate( $elements );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertNotEmpty( $result['messages'] );
		$this->assertEquals( Non_Atomic_Widget_Validator::ERROR_CODE, $result['code'] );
		$this->assertContains( self::NON_ATOMIC_CONTAINER_TYPE, $result['non_atomic_elements'] );
	}

	public function test_validate__detects_non_atomic_widget_at_root() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$elements = [
			$this->create_widget_element( self::NON_ATOMIC_WIDGET_TYPE ),
		];

		// Act
		$result = $validator->validate( $elements );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertNotEmpty( $result['messages'] );
		$this->assertEquals( Non_Atomic_Widget_Validator::ERROR_CODE, $result['code'] );
		$this->assertContains( self::NON_ATOMIC_WIDGET_TYPE, $result['non_atomic_elements'] );
	}

	public function test_validate__detects_non_atomic_widget_nested_in_atomic_container() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$elements = [
			[
				'id' => 'container-1',
				'elType' => self::ATOMIC_CONTAINER_TYPE,
				'settings' => [],
				'elements' => [
					$this->create_widget_element( self::NON_ATOMIC_WIDGET_TYPE ),
				],
			],
		];

		// Act
		$result = $validator->validate( $elements );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertContains( self::NON_ATOMIC_WIDGET_TYPE, $result['non_atomic_elements'] );
	}

	public function test_validate__detects_non_atomic_widget_deeply_nested() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$elements = [
			[
				'id' => 'container-1',
				'elType' => self::ATOMIC_CONTAINER_TYPE,
				'settings' => [],
				'elements' => [
					[
						'id' => 'container-2',
						'elType' => self::ATOMIC_CONTAINER_TYPE,
						'settings' => [],
						'elements' => [
							[
								'id' => 'container-3',
								'elType' => self::ATOMIC_CONTAINER_TYPE,
								'settings' => [],
								'elements' => [
									$this->create_widget_element( self::NON_ATOMIC_WIDGET_TYPE ),
								],
							],
						],
					],
				],
			],
		];

		// Act
		$result = $validator->validate( $elements );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertContains( self::NON_ATOMIC_WIDGET_TYPE, $result['non_atomic_elements'] );
	}

	public function test_validate__returns_unique_element_types() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$elements = [
			$this->create_widget_element( self::NON_ATOMIC_WIDGET_TYPE ),
			$this->create_widget_element( self::NON_ATOMIC_WIDGET_TYPE ),
			$this->create_widget_element( self::NON_ATOMIC_WIDGET_TYPE ),
		];

		// Act
		$result = $validator->validate( $elements );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertCount( 1, $result['non_atomic_elements'] );
	}

	public function test_validate__detects_multiple_different_non_atomic_elements() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$elements = [
			$this->create_widget_element( 'heading' ),
			$this->create_widget_element( 'button' ),
			$this->create_container_element( self::NON_ATOMIC_CONTAINER_TYPE ),
		];

		// Act
		$result = $validator->validate( $elements );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertCount( 3, $result['non_atomic_elements'] );
		$this->assertContains( 'heading', $result['non_atomic_elements'] );
		$this->assertContains( 'button', $result['non_atomic_elements'] );
		$this->assertContains( self::NON_ATOMIC_CONTAINER_TYPE, $result['non_atomic_elements'] );
	}

	public function test_validate__allows_mixed_atomic_with_non_atomic_returns_failure() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$elements = [
			$this->create_widget_element( self::ATOMIC_WIDGET_TYPE ),
			$this->create_widget_element( self::NON_ATOMIC_WIDGET_TYPE ),
		];

		// Act
		$result = $validator->validate( $elements );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertContains( self::NON_ATOMIC_WIDGET_TYPE, $result['non_atomic_elements'] );
	}

	public function test_validate_items__returns_success_for_valid_items() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$items = Collection::make( [
			[
				'uid' => 'component-1',
				'elements' => [
					$this->create_widget_element( self::ATOMIC_WIDGET_TYPE ),
				],
			],
			[
				'uid' => 'component-2',
				'elements' => [
					$this->create_widget_element( self::ATOMIC_WIDGET_TYPE ),
				],
			],
		] );

		// Act
		$result = $validator->validate_items( $items );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate_items__detects_non_atomic_in_any_item() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$items = Collection::make( [
			[
				'uid' => 'component-1',
				'elements' => [
					$this->create_widget_element( self::ATOMIC_WIDGET_TYPE ),
				],
			],
			[
				'uid' => 'component-2',
				'elements' => [
					$this->create_widget_element( self::NON_ATOMIC_WIDGET_TYPE ),
				],
			],
		] );

		// Act
		$result = $validator->validate_items( $items );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertContains( self::NON_ATOMIC_WIDGET_TYPE, $result['non_atomic_elements'] );
	}

	public function test_validate_items__handles_empty_elements() {
		// Arrange
		$validator = Non_Atomic_Widget_Validator::make();
		$items = Collection::make( [
			[
				'uid' => 'component-1',
			],
		] );

		// Act
		$result = $validator->validate_items( $items );

		// Assert
		$this->assertTrue( $result['success'] );
	}

	private function create_widget_element( string $widget_type, string $id = null ): array {
		return [
			'id' => $id ?? 'widget-' . $widget_type . '-' . uniqid(),
			'elType' => 'widget',
			'widgetType' => $widget_type,
			'settings' => [],
			'elements' => [],
		];
	}

	private function create_container_element( string $el_type, string $id = null ): array {
		return [
			'id' => $id ?? 'container-' . $el_type . '-' . uniqid(),
			'elType' => $el_type,
			'settings' => [],
			'elements' => [],
		];
	}
}
