<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Carousel_Promotion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Collection_Loop\Collection_Loop_Promotion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form_Promotion;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Pro_Promotion_Element_Base extends Elementor_Test_Base {

	/**
	 * @dataProvider pro_promotion_element_provider
	 */
	public function test_shared_pro_promotion_meta( string $class, string $el_type ) {
		// Arrange.
		$promotion = new $class(
			[
				'id'       => 'test_promotion',
				'elType'   => $el_type,
				'settings' => [],
			],
			null
		);

		// Assert.
		$this->assertTrue( (bool) $promotion->get_meta_item( 'is_pro_promotion' ) );
		$this->assertTrue( (bool) $promotion->get_meta_item( 'is_container' ) );
		$this->assertFalse( $promotion->get_meta_item( 'llm_support' ) );
		$this->assertFalse( Widget_Context_Helper::is_widget_eligible_for_llm( $promotion->get_config() ) );
	}

	public function test_collection_loop_sets_compound_meta() {
		// Arrange.
		$promotion = new Collection_Loop_Promotion(
			[
				'id'       => 'test_loop_promotion',
				'elType'   => 'e-collection-loop',
				'settings' => [],
			],
			null
		);

		// Assert.
		$this->assertTrue( (bool) $promotion->get_meta_item( 'is_compound' ) );
	}

	public function test_carousel_does_not_set_compound_meta() {
		// Arrange.
		$promotion = new Carousel_Promotion(
			[
				'id'       => 'test_carousel_promotion',
				'elType'   => 'e-carousel',
				'settings' => [],
			],
			null
		);

		// Assert.
		$this->assertNull( $promotion->get_meta_item( 'is_compound' ) );
	}

	public function pro_promotion_element_provider(): array {
		return [
			'carousel' => [ Carousel_Promotion::class, 'e-carousel' ],
			'form' => [ Atomic_Form_Promotion::class, 'e-form' ],
			'collection_loop' => [ Collection_Loop_Promotion::class, 'e-collection-loop' ],
		];
	}
}
