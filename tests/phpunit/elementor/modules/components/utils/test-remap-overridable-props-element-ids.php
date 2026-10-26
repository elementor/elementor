<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Remap_Overridable_Props_Element_Ids;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Remap_Overridable_Props_Element_Ids extends TestCase {
	public function test_apply__remaps_element_id_and_origin_prop_fields_element_id() {
		// Arrange
		$props = [
			'props' => [
				'hero_title' => [
					'elementId' => 'old-element',
					'originPropFields' => [
						'elementId' => 'old-origin-element',
					],
				],
			],
		];

		// Act
		$result = Remap_Overridable_Props_Element_Ids::apply( $props, [
			'old-element' => 'new-element',
			'old-origin-element' => 'new-origin-element',
		] );

		// Assert
		$this->assertSame( 'new-element', $result['props']['hero_title']['elementId'] );
		$this->assertSame( 'new-origin-element', $result['props']['hero_title']['originPropFields']['elementId'] );
	}

	public function test_apply__leaves_unmapped_ids_untouched() {
		// Arrange
		$props = [
			'props' => [
				'hero_title' => [
					'elementId' => 'old-element',
					'originPropFields' => [
						'elementId' => 'old-origin-element',
					],
				],
			],
		];

		// Act
		$result = Remap_Overridable_Props_Element_Ids::apply( $props, [ 'other' => 'new-other' ] );

		// Assert
		$this->assertSame( $props, $result );
	}
}
