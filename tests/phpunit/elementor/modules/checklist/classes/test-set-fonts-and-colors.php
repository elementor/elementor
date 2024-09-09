<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Modules\Checklist\Steps\Set_Fonts_And_Colors;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Set_Fonts_And_Colors_Step extends Step_Test_Base {
	public function setUp(): void {
		parent::setUp();
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test__step_is_completed_when_fonts_and_color_are_assigned() {
		$steps_manager = $this->checklist_module->get_steps_manager();
		$step = $steps_manager->get_step_by_id( Set_Fonts_And_Colors::STEP_ID );
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertFalse( $step->is_absolute_completed() );

		$step->mark_as_completed();
		$this->assertTrue( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertFalse( $step->is_absolute_completed() );

		$step->unmark_as_completed();
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertFalse( $step->is_absolute_completed() );

		$step = new Set_Fonts_And_Colors( $this->checklist_module, $this->wordpress_adapter );
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertTrue( $step->is_absolute_completed() );

		$this->set_wordpress_adapter_mock( [ 'get_settings' ], [
			'get_settings' => '[ "custom_colors" => 1, "custom_typography" => 1 ]',
		] );
		$step = new Set_Fonts_And_Colors( $this->checklist_module, $this->wordpress_adapter );
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertFalse( $step->is_absolute_completed() );
	}

}
