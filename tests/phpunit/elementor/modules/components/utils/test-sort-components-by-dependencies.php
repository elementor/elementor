<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Sort_Components_By_Dependencies;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Sort_Components_By_Dependencies extends Elementor_Test_Base {

	const COMPONENT_A = 43;
	const COMPONENT_B = 1;
	const COMPONENT_C = 3;
	const OUT_OF_KIT_COMPONENT = 999;

	public function test_apply__places_dependencies_before_dependants() {
		// Arrange
		$component_ids = [ self::COMPONENT_A, self::COMPONENT_C, self::COMPONENT_B ];
		$dependencies = [
			self::COMPONENT_A => [ 'depends_on' => [ self::COMPONENT_B, self::COMPONENT_C ] ],
			self::COMPONENT_C => [ 'depends_on' => [ self::COMPONENT_B ] ],
			self::COMPONENT_B => [ 'depends_on' => [] ],
		];

		// Act
		$result = Sort_Components_By_Dependencies::apply( $component_ids, $dependencies );

		// Assert
		$this->assertSame( [ self::COMPONENT_B, self::COMPONENT_C, self::COMPONENT_A ], $result );
	}

	public function test_apply__waits_for_all_dependencies_and_keeps_order_for_ties() {
		// Arrange
		$component_ids = [ self::COMPONENT_A, self::COMPONENT_B, self::COMPONENT_C ];
		$dependencies = [
			self::COMPONENT_A => [ 'depends_on' => [ self::COMPONENT_B, self::COMPONENT_C ] ],
		];

		// Act
		$result = Sort_Components_By_Dependencies::apply( $component_ids, $dependencies );

		// Assert
		$this->assertSame( [ self::COMPONENT_B, self::COMPONENT_C, self::COMPONENT_A ], $result );
	}

	public function test_apply__treats_out_of_kit_references_as_satisfied() {
		// Arrange
		$component_ids = [ self::COMPONENT_A, self::COMPONENT_B ];
		$dependencies = [
			self::COMPONENT_A => [ 'depends_on' => [ self::OUT_OF_KIT_COMPONENT ] ],
			self::COMPONENT_B => [ 'depends_on' => [ self::COMPONENT_A ] ],
		];

		// Act
		$result = Sort_Components_By_Dependencies::apply( $component_ids, $dependencies );

		// Assert
		$this->assertSame( [ self::COMPONENT_A, self::COMPONENT_B ], $result );
	}

	public function test_apply__falls_back_to_original_order_on_cycle() {
		// Arrange
		$component_ids = [ self::COMPONENT_A, self::COMPONENT_B, self::COMPONENT_C ];
		$dependencies = [
			self::COMPONENT_A => [ 'depends_on' => [ self::COMPONENT_B ] ],
			self::COMPONENT_B => [ 'depends_on' => [ self::COMPONENT_A ] ],
			self::COMPONENT_C => [ 'depends_on' => [] ],
		];

		// Act
		$result = Sort_Components_By_Dependencies::apply( $component_ids, $dependencies );

		// Assert
		$this->assertSame( [ self::COMPONENT_C, self::COMPONENT_A, self::COMPONENT_B ], $result );
	}

	public function test_apply__keeps_original_order_without_dependencies() {
		// Arrange
		$component_ids = [ self::COMPONENT_A, self::COMPONENT_B, self::COMPONENT_C ];

		// Act
		$result = Sort_Components_By_Dependencies::apply( $component_ids, [] );

		// Assert
		$this->assertSame( $component_ids, $result );
	}
}
