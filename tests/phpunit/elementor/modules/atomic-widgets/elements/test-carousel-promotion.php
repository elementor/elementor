<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Carousel_Promotion;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Carousel_Promotion extends Elementor_Test_Base {

	public function test_element_type_matches_pro_carousel_type() {
		// Assert.
		$this->assertSame( 'e-carousel', Carousel_Promotion::get_element_type() );
	}

	public function test_is_pro_promotion_meta_is_set() {
		// Arrange.
		$promotion = $this->make_promotion_instance();

		// Assert.
		$this->assertTrue( (bool) $promotion->get_meta_item( 'is_pro_promotion' ) );
	}

	public function test_is_container_meta_is_set() {
		// Arrange.
		$promotion = $this->make_promotion_instance();

		// Assert.
		$this->assertTrue( (bool) $promotion->get_meta_item( 'is_container' ) );
	}

	public function test_should_not_print_empty() {
		// Arrange.
		$promotion = $this->make_promotion_instance();

		$reflection = new ReflectionMethod( $promotion, 'should_print_empty' );
		$reflection->setAccessible( true );

		$this->assertFalse( $reflection->invoke( $promotion ) );
	}

	public function test_should_not_show_in_panel() {
		// Arrange.
		$promotion = $this->make_promotion_instance();

		$reflection = new ReflectionMethod( $promotion, 'should_show_in_panel' );
		$reflection->setAccessible( true );

		$this->assertFalse( $reflection->invoke( $promotion ) );
	}

	public function test_props_schema_contains_classes_prop() {
		// Act.
		$schema = Carousel_Promotion::get_props_schema();

		// Assert.
		$this->assertArrayHasKey( 'classes', $schema );
	}

	private function make_promotion_instance(): Carousel_Promotion {
		return new Carousel_Promotion(
			[
				'id'        => 'test_carousel_promotion',
				'elType'    => 'e-carousel',
				'settings'  => [],
			],
			null
		);
	}
}
