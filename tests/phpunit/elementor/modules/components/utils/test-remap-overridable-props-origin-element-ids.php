<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Remap_Overridable_Props_Origin_Element_Ids;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Remap_Overridable_Props_Origin_Element_Ids extends TestCase {
	const NESTED_SOURCE_ID = 1111;

	public function test_apply__resolves_origin_element_id_from_imported_nested_prop() {
		// Arrange
		$props = $this->make_exposed_props( 'old-inner' );
		$imported_props = [
			self::NESTED_SOURCE_ID => [
				'props' => [
					'inner-key' => [ 'elementId' => 'new-inner' ],
				],
			],
		];

		// Act
		$result = Remap_Overridable_Props_Origin_Element_Ids::apply( $props, $this->make_elements(), $imported_props, [] );

		// Assert
		$this->assertSame( 'new-inner', $result['props']['outer-key']['originPropFields']['elementId'] );
	}

	public function test_apply__prefers_nested_origin_prop_fields_for_deeper_chains() {
		// Arrange
		$props = $this->make_exposed_props( 'old-deepest' );
		$imported_props = [
			self::NESTED_SOURCE_ID => [
				'props' => [
					'inner-key' => [
						'elementId' => 'new-nested-instance',
						'originPropFields' => [ 'elementId' => 'new-deepest' ],
					],
				],
			],
		];

		// Act
		$result = Remap_Overridable_Props_Origin_Element_Ids::apply( $props, $this->make_elements(), $imported_props, [] );

		// Assert
		$this->assertSame( 'new-deepest', $result['props']['outer-key']['originPropFields']['elementId'] );
	}

	public function test_apply__falls_back_to_nested_component_id_map() {
		// Arrange
		$props = $this->make_exposed_props( 'old-inner' );
		$id_maps = [
			self::NESTED_SOURCE_ID => [ 'old-inner' => 'mapped-inner' ],
		];

		// Act
		$result = Remap_Overridable_Props_Origin_Element_Ids::apply( $props, $this->make_elements(), [], $id_maps );

		// Assert
		$this->assertSame( 'mapped-inner', $result['props']['outer-key']['originPropFields']['elementId'] );
	}

	public function test_apply__leaves_unresolvable_origin_element_id_untouched() {
		// Arrange
		$props = $this->make_exposed_props( 'old-inner' );

		// Act
		$result = Remap_Overridable_Props_Origin_Element_Ids::apply( $props, $this->make_elements(), [], [] );

		// Assert
		$this->assertSame( $props, $result );
	}

	private function make_exposed_props( string $origin_element_id ): array {
		return [
			'props' => [
				'outer-key' => [
					'overrideKey' => 'outer-key',
					'elementId' => 'instance',
					'originValue' => [
						'$$type' => 'override',
						'value' => [
							'override_key' => 'inner-key',
							'override_value' => null,
							'schema_source' => [
								'type' => 'component',
								'id' => self::NESTED_SOURCE_ID,
							],
						],
					],
					'originPropFields' => [
						'elementId' => $origin_element_id,
					],
				],
			],
		];
	}

	private function make_elements(): array {
		return [
			[
				'id' => 'wrapper',
				'elType' => 'e-flexbox',
				'elements' => [
					[
						'id' => 'instance',
						'elType' => 'widget',
						'widgetType' => 'e-component',
						'elements' => [],
						'settings' => [
							'component_instance' => [
								'$$type' => 'component-instance',
								'value' => [
									'component_id' => [
										'$$type' => 'number',
										'value' => self::NESTED_SOURCE_ID,
									],
								],
							],
						],
					],
				],
			],
		];
	}
}
