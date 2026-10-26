<?php

namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Module as Components_Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Prepare_Imported_Elements extends Elementor_Test_Base {

	const IMPORTED_COMPONENT_SOURCE_ID = 93;
	const IMPORTED_COMPONENT_DESTINATION_ID = 167;
	const FAILED_COMPONENT_SOURCE_ID = 104;
	const PAGE_SOURCE_ID = 12;

	public function test_map_old_new_component_ids__returns_only_component_mappings() {
		// Arrange
		$imported_data = [
			'templates' => [
				'succeed' => [ 1 => 2 ],
			],
			'content' => [
				'page' => [
					'succeed' => [ self::PAGE_SOURCE_ID => self::FAILED_COMPONENT_SOURCE_ID ],
				],
				'elementor_component' => [
					'succeed' => [ self::IMPORTED_COMPONENT_SOURCE_ID => self::IMPORTED_COMPONENT_DESTINATION_ID ],
				],
			],
		];

		// Act
		$result = Components_Module::map_old_new_component_ids( $imported_data );

		// Assert
		$this->assertSame(
			[ self::IMPORTED_COMPONENT_SOURCE_ID => self::IMPORTED_COMPONENT_DESTINATION_ID ],
			$result
		);
	}

	public function test_map_old_new_component_ids__no_components_returns_empty() {
		// Act
		$result = Components_Module::map_old_new_component_ids( [ 'content' => [ 'page' => [ 'succeed' => [ 1 => 2 ] ] ] ] );

		// Assert
		$this->assertSame( [], $result );
	}

	public function test_prepare_imported_elements__strips_failed_component_colliding_with_imported_post_id() {
		// Arrange
		$elements = [
			$this->make_component_instance_element( 'imported', self::IMPORTED_COMPONENT_SOURCE_ID ),
			$this->make_component_instance_element( 'failed', self::FAILED_COMPONENT_SOURCE_ID ),
		];

		$imported_data = [
			'content' => [
				'page' => [
					'succeed' => [ self::PAGE_SOURCE_ID => self::FAILED_COMPONENT_SOURCE_ID ],
				],
				'elementor_component' => [
					'succeed' => [ self::IMPORTED_COMPONENT_SOURCE_ID => self::IMPORTED_COMPONENT_DESTINATION_ID ],
				],
			],
		];

		// Act
		$result = Components_Module::prepare_imported_elements(
			$elements,
			Components_Module::map_old_new_component_ids( $imported_data )
		);

		// Assert
		$this->assertCount( 1, $result );
		$this->assertSame( 'imported', $result[0]['id'] );
		$this->assertSame(
			self::IMPORTED_COMPONENT_DESTINATION_ID,
			$result[0]['settings']['component_instance']['value']['component_id']['value']
		);
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
