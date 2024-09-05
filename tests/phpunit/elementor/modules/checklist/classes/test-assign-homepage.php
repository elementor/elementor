<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Modules\Checklist\Steps\Assign_Homepage;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Assign_Homepage_Step extends Step_Test_Base {
	public function setUp(): void {
		parent::setUp();
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test__step_is_completed_when_homepage_is_assigned() {
		$steps_manager = $this->checklist_module->get_steps_manager();
		$step = $steps_manager->get_step_by_id( Assign_Homepage::STEP_ID );
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

		$this->set_wordpress_adapter_mock( [ 'get_option' ], [
			'get_option' => '2',
		] );
		$step = new Assign_Homepage( $this->checklist_module, $this->wordpress_adapter );
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertTrue( $step->is_absolute_completed() );

		$this->set_wordpress_adapter_mock( [ 'get_option' ], [
			'get_option' => '0',
		] );
		$step = new Assign_Homepage( $this->checklist_module, $this->wordpress_adapter );
		$this->assertFalse( $step->is_marked_as_completed() );
		$this->assertFalse( $step->is_immutable_completed() );
		$this->assertFalse( $step->is_absolute_completed() );
	}

}
