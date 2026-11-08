<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Remap_Override_Schema_Source;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Components
 */
class Test_Remap_Override_Schema_Source extends TestCase {

	const SOURCE_COMPONENT_ID = 93;
	const DESTINATION_COMPONENT_ID = 167;
	const UNMAPPED_COMPONENT_ID = 104;

	public function test_apply__remaps_override_schema_source() {
		// Arrange
		$item = $this->override( self::SOURCE_COMPONENT_ID );

		// Act
		$result = Remap_Override_Schema_Source::apply( $item, [ self::SOURCE_COMPONENT_ID => self::DESTINATION_COMPONENT_ID ] );

		// Assert
		$this->assertSame( self::DESTINATION_COMPONENT_ID, $result['value']['schema_source']['id'] );
	}

	public function test_apply__remaps_overridable_origin_value() {
		// Arrange
		$item = [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => 'outer-key',
				'origin_value' => $this->override( self::SOURCE_COMPONENT_ID ),
			],
		];

		// Act
		$result = Remap_Override_Schema_Source::apply( $item, [ self::SOURCE_COMPONENT_ID => self::DESTINATION_COMPONENT_ID ] );

		// Assert
		$this->assertSame( self::DESTINATION_COMPONENT_ID, $result['value']['origin_value']['value']['schema_source']['id'] );
	}

	public function test_apply__leaves_unmapped_and_unrelated_items_untouched() {
		// Arrange
		$unmapped = $this->override( self::UNMAPPED_COMPONENT_ID );
		$unrelated = [
			'$$type' => 'string',
			'value' => 'text',
		];
		$map = [ self::SOURCE_COMPONENT_ID => self::DESTINATION_COMPONENT_ID ];

		// Act
		$unmapped_result = Remap_Override_Schema_Source::apply( $unmapped, $map );
		$unrelated_result = Remap_Override_Schema_Source::apply( $unrelated, $map );

		// Assert
		$this->assertSame( $unmapped, $unmapped_result );
		$this->assertSame( $unrelated, $unrelated_result );
	}

	private function override( int $component_id ): array {
		return [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'prop-key',
				'override_value' => null,
				'schema_source' => [
					'type' => 'component',
					'id' => $component_id,
				],
			],
		];
	}
}
