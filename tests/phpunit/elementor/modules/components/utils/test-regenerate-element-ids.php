<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Regenerate_Element_Ids;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Regenerate_Element_Ids extends TestCase {
	public function test_apply__regenerates_nested_ids_and_tracks_original_to_new_map() {
		// Arrange
		$elements = [
			[
				'id' => 'parent1',
				'elType' => 'e-flexbox',
				'elements' => [
					[
						'id' => 'child01',
						'elType' => 'widget',
						'elements' => [],
					],
				],
			],
		];

		// Act
		$result = Regenerate_Element_Ids::apply( $elements );

		// Assert
		$id_map = $result['id_map'];
		$parent = $result['elements'][0];

		$this->assertSame( [ 'parent1', 'child01' ], array_keys( $id_map ) );
		$this->assertSame( $id_map['parent1'], $parent['id'] );
		$this->assertSame( $id_map['child01'], $parent['elements'][0]['id'] );
		$this->assertNotSame( 'parent1', $parent['id'] );
		$this->assertNotSame( $parent['id'], $parent['elements'][0]['id'] );
	}

	public function test_apply__returns_empty_map_for_empty_elements() {
		// Act
		$result = Regenerate_Element_Ids::apply( [] );

		// Assert
		$this->assertSame( [ 'elements' => [], 'id_map' => [] ], $result );
	}
}
