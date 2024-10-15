<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Modules\Checklist\Steps\Add_Logo;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Add_Logo_Step extends Step_Test_Base {
	public function setUp(): void {
		$this->set_wordpress_adapter_mock( [ 'has_custom_logo' ], [
			'has_custom_logo' => false,
		] );
		parent::setUp();
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test__step_is_completed_when_logo_is_set() {
		$steps_manager = $this->checklist_module->get_steps_manager();
		$step = $steps_manager->get_step_by_id( Add_Logo::STEP_ID );
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

		$this->set_wordpress_adapter_mock( [ 'has_custom_logo' ], [
			'has_custom_logo' => true,
		] );

		$step = new Add_Logo( $this->checklist_module, $this->wordpress_adapter );
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertTrue( $step->is_absolute_completed() );
	}

}
