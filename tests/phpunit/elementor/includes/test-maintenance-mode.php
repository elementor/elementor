<?php

namespace Elementor\Testing\Includes;

use Elementor\Maintenance_Mode;
use Elementor\Plugin;
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

	/**
	 *
	 */
	public function test_maintenance_mode_should_be_active() {
		$this->markTestSkipped();
		$template_id = $this->factory()->get_local_template_id();
		update_option( 'elementor_maintenance_mode_mode', 'coming_soon' );
		update_option( 'elementor_maintenance_mode_template_id', $template_id );

		query_posts( '' );

		$this->maintenance_mode->template_redirect();
		// Set current queried object id.
		global $wp_query, $post;
		$wp_query->post = $post;

		ob_start();

		require_once get_index_template();

		$content = ob_get_contents();

		var_dump( $content );
		$this->assertContains( 'elementor-maintenance-mode', $content );
		$this->assertContains( 'elementor-page-' . $template_id, $content );
		//Assert `file_contents_get( home_url() )` contains 'elementor-maintenance-mode'  &&  "elementor-page-$post_id"

	}
}
