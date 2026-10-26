<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Remap_Variants_Element_Ids;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Remap_Variants_Element_Ids extends TestCase {
	public function test_apply__rekeys_widget_entries_by_remapped_element_id() {
		// Arrange
		$variants = [
			'variants' => [
				[
					'id' => 'primary',
					'label' => 'Primary',
					'widgets' => [
						'old-element' => [ 'variant' => 'nested' ],
						'untouched-element' => [ 'variant' => 'self' ],
					],
				],
			],
		];

		// Act
		$result = Remap_Variants_Element_Ids::apply( $variants, [ 'old-element' => 'new-element' ] );

		// Assert
		$this->assertArrayHasKey( 'new-element', $result['variants'][0]['widgets'] );
		$this->assertArrayHasKey( 'untouched-element', $result['variants'][0]['widgets'] );
		$this->assertArrayNotHasKey( 'old-element', $result['variants'][0]['widgets'] );
	}

	public function test_apply__keeps_variants_without_widgets_untouched() {
		// Arrange
		$variants = [
			'variants' => [
				[
					'id' => 'primary',
					'label' => 'Primary',
				],
			],
		];

		// Act
		$result = Remap_Variants_Element_Ids::apply( $variants, [ 'old-element' => 'new-element' ] );

		// Assert
		$this->assertSame( $variants, $result );
	}
}
