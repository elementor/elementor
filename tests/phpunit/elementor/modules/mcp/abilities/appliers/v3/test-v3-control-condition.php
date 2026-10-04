<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Condition;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Inactive_Condition_Warnings;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Control_Condition extends TestCase {

	private function controls(): array {
		return [
			'layout' => [ 'default' => 'horizontal' ],
			'pointer' => [ 'default' => 'underline' ],
			'icon' => [ 'default' => [ 'value' => '' ] ],
			'animation_line' => [ 'condition' => [ 'pointer' => [ 'underline', 'overline' ] ] ],
			'padding_dropdown' => [ 'condition' => [ 'layout' => 'dropdown' ] ],
		];
	}

	public function test_is_met__falls_back_to_control_defaults() {
		// Arrange.
		$condition = [
			'layout!' => 'dropdown',
			'pointer' => [ 'underline', 'overline' ],
		];

		// Act.
		$result = V3_Control_Condition::is_met( $condition, [], $this->controls() );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_met__fails_when_negated_term_matches() {
		// Arrange.
		$condition = [ 'layout!' => 'dropdown' ];
		$settings = [ 'layout' => 'dropdown' ];

		// Act.
		$result = V3_Control_Condition::is_met( $condition, $settings, $this->controls() );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_met__reads_sub_key_of_object_setting() {
		// Arrange.
		$condition = [ 'icon[value]!' => '' ];
		$settings = [ 'icon' => [ 'value' => 'fas fa-star' ] ];

		// Act.
		$result = V3_Control_Condition::is_met( $condition, $settings, $this->controls() );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_describe__joins_terms_in_plain_language() {
		// Arrange.
		$condition = [
			'layout!' => 'dropdown',
			'pointer' => [ 'underline', 'overline' ],
		];

		// Act.
		$result = V3_Control_Condition::describe( $condition );

		// Assert.
		$this->assertSame( "layout is not 'dropdown' and pointer is one of 'underline', 'overline'", $result );
	}

	public function test_collect__warns_only_for_unmet_conditions_including_responsive_keys() {
		// Arrange.
		$settings = [ 'pointer' => 'overline' ];
		$written_keys = [ 'animation_line', 'padding_dropdown_mobile', 'layout' ];

		// Act.
		$result = V3_Inactive_Condition_Warnings::collect( $written_keys, $settings, $this->controls() );

		// Assert.
		$this->assertSame(
			[ "Setting padding_dropdown_mobile was saved but only takes effect when layout is 'dropdown'." ],
			$result
		);
	}
}
