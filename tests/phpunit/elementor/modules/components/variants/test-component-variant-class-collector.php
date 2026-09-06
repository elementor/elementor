<?php

namespace Elementor\Testing\Modules\Components\Variants;

use Elementor\Modules\Components\Variants\Component_Variant_Class_Collector;
use Elementor\Modules\Components\Variants\Component_Variants;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Variant_Class_Collector extends TestCase {

	public function test_collect__with_no_variants__returns_empty_array() {
		// Arrange.
		$variants = Component_Variants::make( [] );

		// Act.
		$result = Component_Variant_Class_Collector::collect( $variants );

		// Assert.
		$this->assertSame( [], $result );
	}

	public function test_collect__with_single_variant__returns_all_class_ids() {
		// Arrange.
		$variants = Component_Variants::make( [
			'variants' => [
				[
					'id' => 'v_green000',
					'label' => 'Green',
					'widgets' => [
						'e-button-1' => [
							'settings' => [ 'classes' => [ 'add' => [ 'g-abc', 'g-def' ] ] ],
						],
					],
				],
			],
		] );

		// Act.
		$result = Component_Variant_Class_Collector::collect( $variants );

		// Assert.
		$this->assertSame( [ 'g-abc', 'g-def' ], $result );
	}

	public function test_collect__with_multiple_variants__concatenates_class_ids() {
		// Arrange.
		$variants = Component_Variants::make( [
			'variants' => [
				[
					'id' => 'v_first000',
					'label' => 'First',
					'widgets' => [
						'e-a' => [ 'settings' => [ 'classes' => [ 'add' => [ 'g-1', 'g-2' ] ] ] ],
					],
				],
				[
					'id' => 'v_second00',
					'label' => 'Second',
					'widgets' => [
						'e-a' => [ 'settings' => [ 'classes' => [ 'add' => [ 'g-2', 'g-3' ] ] ] ],
						'e-b' => [ 'settings' => [ 'classes' => [ 'add' => [ 'g-4' ] ] ] ],
					],
				],
			],
		] );

		// Act.
		$result = Component_Variant_Class_Collector::collect( $variants );

		// Assert. Duplicates are preserved; callers dedupe.
		$this->assertSame( [ 'g-1', 'g-2', 'g-2', 'g-3', 'g-4' ], $result );
	}

	public function test_collect__ignores_widget_entries_without_classes_add() {
		// Arrange. Widgets that only pin nested variants (no class contributions) must not affect collection.
		$variants = Component_Variants::make( [
			'variants' => [
				[
					'id' => 'v_pin00000',
					'label' => 'Pin',
					'widgets' => [
						'e-nested' => [ 'variant' => 'v_child000' ],
						'e-styled' => [ 'settings' => [ 'classes' => [ 'add' => [ 'g-x' ] ] ] ],
					],
				],
			],
		] );

		// Act.
		$result = Component_Variant_Class_Collector::collect( $variants );

		// Assert.
		$this->assertSame( [ 'g-x' ], $result );
	}
}
