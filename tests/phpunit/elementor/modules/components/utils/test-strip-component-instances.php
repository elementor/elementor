<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Strip_Component_Instances;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Components
 */
class Test_Strip_Component_Instances extends TestCase {

	public function test_apply__removes_top_level_component_instances() {
		// Arrange
		$elements = [
			$this->component_instance( 'ci-1' ),
			$this->widget( 'button-1', 'e-button' ),
			$this->component_instance( 'ci-2' ),
		];

		// Act
		$result = Strip_Component_Instances::apply( $elements );

		// Assert
		$this->assertCount( 1, $result );
		$this->assertSame( 'button-1', $result[0]['id'] );
	}

	public function test_apply__removes_nested_component_instances_and_preserves_containers() {
		// Arrange
		$elements = [
			[
				'id' => 'container-1',
				'elType' => 'container',
				'elements' => [
					$this->component_instance( 'ci-1' ),
					$this->widget( 'heading-1', 'e-heading' ),
					[
						'id' => 'inner-container',
						'elType' => 'container',
						'elements' => [
							$this->component_instance( 'ci-2' ),
						],
					],
				],
			],
		];

		// Act
		$result = Strip_Component_Instances::apply( $elements );

		// Assert
		$this->assertCount( 1, $result );
		$this->assertCount( 2, $result[0]['elements'] );
		$this->assertSame( 'heading-1', $result[0]['elements'][0]['id'] );
		$this->assertSame( 'inner-container', $result[0]['elements'][1]['id'] );
		$this->assertSame( [], $result[0]['elements'][1]['elements'] );
	}

	public function test_apply__leaves_non_component_widgets_untouched() {
		// Arrange
		$elements = [ $this->widget( 'button-1', 'e-button' ) ];

		// Act
		$result = Strip_Component_Instances::apply( $elements );

		// Assert
		$this->assertSame( $elements, $result );
	}

	private function component_instance( string $id ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => 'e-component',
			'settings' => [],
		];
	}

	private function widget( string $id, string $widget_type ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => $widget_type,
			'settings' => [],
		];
	}
}
