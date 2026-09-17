<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Abstract_Ability_Permissions extends Elementor_Test_Base {

	public function test_check_permission__returns_false_when_callback_denies() {
		// Arrange
		$this->act_as_editor();
		$ability = new Manage_Variable_Ability();

		// Act / Assert
		$this->assertFalse( $ability->check_permission() );
	}

	public function test_check_permission__returns_true_when_callback_allows() {
		// Arrange
		$this->act_as_admin();
		$ability = new Manage_Variable_Ability();

		// Act / Assert
		$this->assertTrue( $ability->check_permission() );
	}

	public function test_check_permission__uses_definition_callback() {
		// Arrange
		$ability = new class() extends Abstract_Ability {
			protected function get_ability_id(): string {
				return 'elementor/test-permission-ability';
			}

			protected function get_definition(): Ability_Definition {
				return new Ability_Definition(
					'Test',
					'Test',
					'elementor',
					[ 'type' => 'object' ],
					[],
					fn() => false
				);
			}

			public function execute( $input = [] ) {
				return [];
			}
		};

		// Act / Assert
		$this->assertFalse( $ability->check_permission() );
	}
}
