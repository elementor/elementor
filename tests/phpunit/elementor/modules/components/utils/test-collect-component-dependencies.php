<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Collect_Component_Dependencies;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Collect_Component_Dependencies extends Elementor_Test_Base {

	const FIRST_COMPONENT_ID = 1;
	const SECOND_COMPONENT_ID = 3;

	public function test_from_elements__collects_nested_unique_sorted_ids() {
		// Arrange
		$elements = [
			[
				'id' => 'container',
				'elType' => 'e-flexbox',
				'elements' => [
					$this->make_component_instance_element( 'nested-second', self::SECOND_COMPONENT_ID ),
					$this->make_component_instance_element( 'nested-first', self::FIRST_COMPONENT_ID ),
				],
			],
			$this->make_component_instance_element( 'duplicate-second', self::SECOND_COMPONENT_ID ),
		];

		// Act
		$result = Collect_Component_Dependencies::from_elements( $elements );

		// Assert
		$this->assertSame( [ self::FIRST_COMPONENT_ID, self::SECOND_COMPONENT_ID ], $result );
	}

	public function test_from_elements__ignores_non_component_widgets() {
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
		$result = Collect_Component_Dependencies::from_elements( $elements );

		// Assert
		$this->assertSame( [], $result );
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
