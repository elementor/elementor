<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Remap_Component_Instance_Ids;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Remap_Component_Instance_Ids extends Elementor_Test_Base {

	const SOURCE_COMPONENT_ID = 93;
	const DESTINATION_COMPONENT_ID = 167;
	const UNMAPPED_COMPONENT_ID = 104;

	public function test_apply__maps_nested_and_leaves_unmapped_untouched() {
		// Arrange
		$elements = [
			[
				'id' => 'loop-item',
				'elType' => 'e-collection-loop-item',
				'elements' => [
					$this->make_component_instance_element( 'nested-component', self::SOURCE_COMPONENT_ID ),
				],
			],
			$this->make_component_instance_element( 'standalone-component', self::UNMAPPED_COMPONENT_ID ),
		];

		$post_ids_map = [
			self::SOURCE_COMPONENT_ID => self::DESTINATION_COMPONENT_ID,
		];

		// Act
		$result = Remap_Component_Instance_Ids::apply( $elements, $post_ids_map );

		// Assert
		$this->assertSame(
			self::DESTINATION_COMPONENT_ID,
			$result[0]['elements'][0]['settings']['component_instance']['value']['component_id']['value']
		);
		$this->assertSame(
			self::UNMAPPED_COMPONENT_ID,
			$result[1]['settings']['component_instance']['value']['component_id']['value']
		);
	}

	public function test_apply__empty_map_short_circuits() {
		// Arrange
		$elements = [
			$this->make_component_instance_element( 'standalone-component', self::SOURCE_COMPONENT_ID ),
		];

		// Act
		$result = Remap_Component_Instance_Ids::apply( $elements, [] );

		// Assert
		$this->assertSame( $elements, $result );
	}

	public function test_apply__ignores_non_component_widgets() {
		// Arrange
		$elements = [
			[
				'id' => 'button',
				'elType' => 'widget',
				'widgetType' => 'e-button',
				'settings' => [ 'text' => 'Click' ],
			],
		];

		// Act
		$result = Remap_Component_Instance_Ids::apply( $elements, [ self::SOURCE_COMPONENT_ID => self::DESTINATION_COMPONENT_ID ] );

		// Assert
		$this->assertSame( $elements, $result );
	}

	public function test_apply__remaps_override_schema_source_with_component_id() {
		// Arrange
		$element = $this->make_component_instance_element( 'standalone-component', self::SOURCE_COMPONENT_ID );
		$element['settings']['component_instance']['value']['overrides'] = [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-key',
						'override_value' => null,
						'schema_source' => [
							'type' => 'component',
							'id' => self::SOURCE_COMPONENT_ID,
						],
					],
				],
			],
		];

		// Act
		$result = Remap_Component_Instance_Ids::apply( [ $element ], [ self::SOURCE_COMPONENT_ID => self::DESTINATION_COMPONENT_ID ] );

		// Assert
		$instance_value = $result[0]['settings']['component_instance']['value'];
		$this->assertSame( self::DESTINATION_COMPONENT_ID, $instance_value['component_id']['value'] );
		$this->assertSame( self::DESTINATION_COMPONENT_ID, $instance_value['overrides']['value'][0]['value']['schema_source']['id'] );
	}

	public function test_apply__does_not_add_overrides_when_missing() {
		// Arrange
		$elements = [
			$this->make_component_instance_element( 'standalone-component', self::SOURCE_COMPONENT_ID ),
		];

		// Act
		$result = Remap_Component_Instance_Ids::apply( $elements, [ self::SOURCE_COMPONENT_ID => self::DESTINATION_COMPONENT_ID ] );

		// Assert
		$this->assertArrayNotHasKey( 'overrides', $result[0]['settings']['component_instance']['value'] );
	}

	private function make_component_instance_element( string $id, int $component_id ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => 'e-component',
			'settings' => [
				'component_instance' => [
					'$$type' => 'component-instance',
					'value' => [
						'component_id' => [
							'$$type' => 'number',
							'value' => $component_id,
						],
					],
				],
			],
		];
	}
}
