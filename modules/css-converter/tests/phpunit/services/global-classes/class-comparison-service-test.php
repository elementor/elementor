<?php
namespace Elementor\Modules\CssConverter\Tests\Services\GlobalClasses;

use Elementor\Modules\CssConverter\Services\GlobalClasses\Class_Comparison_Service;
use WP_UnitTestCase;

class Class_Comparison_Service_Test extends WP_UnitTestCase {
	private $service;

	public function setUp(): void {
		parent::setUp();
		$this->service = new Class_Comparison_Service();
	}

	public function test_identical_classes_are_equal() {
		$class_a = $this->create_test_class( [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
			'padding' => [ '$$type' => 'dimensions', 'value' => [ 'top' => '10px' ] ],
		] );

		$class_b = $this->create_test_class( [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
			'padding' => [ '$$type' => 'dimensions', 'value' => [ 'top' => '10px' ] ],
		] );

		$this->assertTrue( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_different_property_values_are_not_equal() {
		$class_a = $this->create_test_class( [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
		] );

		$class_b = $this->create_test_class( [
			'color' => [ '$$type' => 'color', 'value' => '#00ff00' ],
		] );

		$this->assertFalse( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_different_property_count_not_equal() {
		$class_a = $this->create_test_class( [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
			'padding' => [ '$$type' => 'dimensions', 'value' => [ 'top' => '10px' ] ],
		] );

		$class_b = $this->create_test_class( [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
		] );

		$this->assertFalse( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_property_order_does_not_matter() {
		$class_a = $this->create_test_class( [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
			'padding' => [ '$$type' => 'dimensions', 'value' => [ 'top' => '10px' ] ],
			'margin' => [ '$$type' => 'dimensions', 'value' => [ 'top' => '5px' ] ],
		] );

		$class_b = $this->create_test_class( [
			'margin' => [ '$$type' => 'dimensions', 'value' => [ 'top' => '5px' ] ],
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
			'padding' => [ '$$type' => 'dimensions', 'value' => [ 'top' => '10px' ] ],
		] );

		$this->assertTrue( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_nested_object_order_normalized() {
		$class_a = $this->create_test_class( [
			'border' => [
				'$$type' => 'border',
				'value' => [
					'top' => [ 'width' => '1px', 'color' => '#000' ],
					'bottom' => [ 'width' => '2px', 'color' => '#fff' ],
				],
			],
		] );

		$class_b = $this->create_test_class( [
			'border' => [
				'$$type' => 'border',
				'value' => [
					'bottom' => [ 'width' => '2px', 'color' => '#fff' ],
					'top' => [ 'width' => '1px', 'color' => '#000' ],
				],
			],
		] );

		$this->assertTrue( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_different_atomic_types_not_equal() {
		$class_a = $this->create_test_class( [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
		] );

		$class_b = $this->create_test_class( [
			'color' => [ '$$type' => 'typography', 'value' => '#ff0000' ],
		] );

		$this->assertFalse( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_missing_variant_not_equal() {
		$class_a = [
			'id' => 'test',
			'label' => 'test',
			'type' => 'class',
			'variants' => [],
		];

		$class_b = $this->create_test_class( [
			'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
		] );

		$this->assertFalse( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_different_breakpoints_not_equal() {
		$class_a = [
			'id' => 'test',
			'label' => 'test',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ],
					'custom_css' => null,
				],
			],
		];

		$class_b = [
			'id' => 'test',
			'label' => 'test',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'tablet', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ],
					'custom_css' => null,
				],
			],
		];

		$this->assertFalse( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_different_states_not_equal() {
		$class_a = [
			'id' => 'test',
			'label' => 'test',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ],
					'custom_css' => null,
				],
			],
		];

		$class_b = [
			'id' => 'test',
			'label' => 'test',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => 'hover' ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ],
					'custom_css' => null,
				],
			],
		];

		$this->assertFalse( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_empty_props_are_equal() {
		$class_a = $this->create_test_class( [] );
		$class_b = $this->create_test_class( [] );

		$this->assertTrue( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	public function test_complex_nested_structures() {
		$class_a = $this->create_test_class( [
			'background' => [
				'$$type' => 'background',
				'value' => [
					'classic' => [
						'color' => '#ff0000',
						'image' => [ 'url' => 'test.jpg', 'id' => 123 ],
						'position' => 'center center',
					],
				],
			],
		] );

		$class_b = $this->create_test_class( [
			'background' => [
				'$$type' => 'background',
				'value' => [
					'classic' => [
						'color' => '#ff0000',
						'image' => [ 'url' => 'test.jpg', 'id' => 123 ],
						'position' => 'center center',
				],
				],
			],
		] );

		$this->assertTrue( $this->service->are_classes_identical( $class_a, $class_b ) );
	}

	private function create_test_class( array $props ): array {
		return [
			'id' => 'test-' . wp_generate_password( 7, false ),
			'label' => 'test',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $props,
					'custom_css' => null,
				],
			],
		];
	}
}

