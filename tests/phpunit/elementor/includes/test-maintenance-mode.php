<?php
namespace Elementor\Testing\Includes;

use Elementor\Maintenance_Mode;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Maintenance_Mode extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Maintenance_Mode
	 */
	private $maintenance_mode;

	public function setUp() {
		parent::setUp();
		if ( ! $this->maintenance_mode ) {
			$this->maintenance_mode = new Maintenance_Mode();
		}
	}

	/**
	 * @covers \Elementor\Maintenance_Mode::body_class()
	 */
	public function test_should_return_classes_with_elementor_maintenance_mode() {
		$this->assertEquals(
			'elementor-maintenance-mode',
			$this->maintenance_mode->body_class( [] )[0]
		);
	}

	public function test_should_return_from_template_redirect() {
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );
		$this->maintenance_mode->template_redirect();
		$this->assertNull( $GLOBALS['post'] );
	}

	public function test_should_set_globals_post_template_redirect() {
		wp_set_current_user( $this->factory()->get_subscriber_user()->ID );
		Maintenance_Mode::set( 'template_id', $this->factory()->get_local_template_id() );
		$this->maintenance_mode->template_redirect();
		$this->assertNotNull( $GLOBALS['post'] );
	}
}
