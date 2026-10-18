<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Condition;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Inactive_Condition_Warnings;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Inactive_Condition_Warnings extends TestCase {

	private function controls(): array {
		return [
			'layout' => [
				'type' => 'select',
				'default' => 'horizontal',
			],
			'dropdown' => [
				'type' => 'select',
				'default' => 'tablet',
			],
			'pointer' => [
				'type' => 'select',
				'condition' => [ 'layout!' => 'dropdown' ],
			],
			'menu_name' => [ 'type' => 'text' ],
		];
	}

	private function layout_visibility(): callable {
		return function ( array $control, array $values ): bool {
			$expected = $control['condition']['layout!'] ?? null;

			return null === $expected || $expected !== ( $values['layout'] ?? null );
		};
	}

	public function test_describe__words_negated_and_one_of_terms() {
		// Arrange.
		$condition = [
			'layout!' => 'dropdown',
			'pointer' => [ 'underline', 'overline' ],
			'link[url]!' => '',
		];

		// Act.
		$description = V3_Control_Condition::describe( $condition );

		// Assert.
		$this->assertSame(
			"layout is not 'dropdown' and pointer is one of 'underline', 'overline' and link.url is not ''",
			$description
		);
	}

	public function test_collect__warns_when_written_control_is_hidden_by_final_settings() {
		// Arrange.
		$settings = [
			'layout' => 'dropdown',
			'pointer' => 'underline',
		];

		// Act.
		$messages = V3_Inactive_Condition_Warnings::collect( [ 'pointer' ], $settings, $this->controls(), $this->layout_visibility() );

		// Assert.
		$this->assertSame(
			[ "Setting pointer was saved but only takes effect when layout is not 'dropdown'." ],
			$messages
		);
	}

	public function test_collect__stays_silent_when_condition_holds() {
		// Arrange.
		$settings = [
			'layout' => 'vertical',
			'pointer' => 'underline',
		];

		// Act.
		$messages = V3_Inactive_Condition_Warnings::collect( [ 'pointer' ], $settings, $this->controls(), $this->layout_visibility() );

		// Assert.
		$this->assertSame( [], $messages );
	}

	public function test_collect__fills_unset_settings_with_control_defaults() {
		// Arrange.
		$received_values = null;
		$is_visible = function ( array $control, array $values ) use ( &$received_values ): bool {
			$received_values = $values;

			return true;
		};

		// Act.
		V3_Inactive_Condition_Warnings::collect( [ 'pointer' ], [ 'pointer' => 'underline' ], $this->controls(), $is_visible );

		// Assert.
		$this->assertSame( 'horizontal', $received_values['layout'] );
		$this->assertSame( 'tablet', $received_values['dropdown'] );
		$this->assertSame( 'underline', $received_values['pointer'] );
	}

	public function test_collect__ignores_written_keys_without_conditions_or_controls() {
		// Arrange.
		$never_visible = fn() => false;

		// Act.
		$messages = V3_Inactive_Condition_Warnings::collect( [ 'menu_name', 'unknown' ], [], $this->controls(), $never_visible );

		// Assert.
		$this->assertSame( [], $messages );
	}
}
