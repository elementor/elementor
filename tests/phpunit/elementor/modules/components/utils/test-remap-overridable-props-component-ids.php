<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Remap_Overridable_Props_Component_Ids;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Remap_Overridable_Props_Component_Ids extends TestCase {
	const SOURCE_NESTED_COMPONENT_ID = 23;
	const DESTINATION_NESTED_COMPONENT_ID = 401;

	public function test_apply__remaps_override_origin_value_schema_source_id() {
		// Arrange
		$props = $this->make_props( [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'inner-prop',
				'override_value' => null,
				'schema_source' => [
					'type' => 'component',
					'id' => self::SOURCE_NESTED_COMPONENT_ID,
				],
			],
		] );

		// Act
		$result = Remap_Overridable_Props_Component_Ids::apply( $props, [
			self::SOURCE_NESTED_COMPONENT_ID => self::DESTINATION_NESTED_COMPONENT_ID,
		] );

		// Assert
		$this->assertSame(
			self::DESTINATION_NESTED_COMPONENT_ID,
			$result['props']['outer-prop']['originValue']['value']['schema_source']['id']
		);
	}

	public function test_apply__leaves_plain_origin_values_and_unmapped_ids_untouched() {
		// Arrange
		$plain_props = $this->make_props( [
			'$$type' => 'escaped-html',
			'value' => 'Title',
		] );
		$unmapped_props = $this->make_props( [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'inner-prop',
				'override_value' => null,
				'schema_source' => [
					'type' => 'component',
					'id' => self::SOURCE_NESTED_COMPONENT_ID,
				],
			],
		] );
		$post_ids_map = [ 999 => self::DESTINATION_NESTED_COMPONENT_ID ];

		// Act
		$plain_result = Remap_Overridable_Props_Component_Ids::apply( $plain_props, $post_ids_map );
		$unmapped_result = Remap_Overridable_Props_Component_Ids::apply( $unmapped_props, $post_ids_map );

		// Assert
		$this->assertSame( $plain_props, $plain_result );
		$this->assertSame( $unmapped_props, $unmapped_result );
	}

	private function make_props( array $origin_value ): array {
		return [
			'props' => [
				'outer-prop' => [
					'overrideKey' => 'outer-prop',
					'originValue' => $origin_value,
				],
			],
			'groups' => [],
		];
	}
}
