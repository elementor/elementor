<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Modules\Checklist\Steps\Add_Logo;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Add_Logo_Step extends Step_Test_Base {
	public function setUp(): void {
		parent::setUp();
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test__returns_correct_cta_url_with_existing_query_params() {
		$_SERVER['HTTP_REFERER'] = 'http://elementor-dev.local/wp-admin/post.php?post=11&action=elementor';
		$step = new Add_Logo( $this->checklist_module, $this->wordpress_adapter );
		$expected_url = 'http://elementor-dev.local/wp-admin/post.php?post=11&action=elementor&active-document=5&active-tab=settings-site-identity';
		$this->assertEquals($expected_url, $step->get_cta_url());
	}

	public function test__returns_correct_cta_url_without_existing_query_params() {
		$_SERVER['HTTP_REFERER'] = 'http://elementor-dev.local/wp-admin/post.php';
		$step = new Add_Logo( $this->checklist_module, $this->wordpress_adapter );
		$expected_url = 'http://elementor-dev.local/wp-admin/post.php?active-document=5&active-tab=settings-site-identity';
		$this->assertEquals($expected_url, $step->get_cta_url());
	}

	public function test__returns_correct_cta_url_with_fragment() {
		$_SERVER['HTTP_REFERER'] = 'http://elementor-dev.local/wp-admin/post.php?post=11#section';
		$step = new Add_Logo( $this->checklist_module, $this->wordpress_adapter );
		$expected_url = 'http://elementor-dev.local/wp-admin/post.php?post=11&active-document=5&active-tab=settings-site-identity#section';
		$this->assertEquals($expected_url, $step->get_cta_url());
	}

	public function test__returns_correct_cta_url_with_encoded_characters() {
		$_SERVER['HTTP_REFERER'] = 'http://elementor-dev.local/wp-admin/post.php?post=11&action=edit%20post';
		$step = new Add_Logo( $this->checklist_module, $this->wordpress_adapter );
		$expected_url = 'http://elementor-dev.local/wp-admin/post.php?post=11&action=edit%20post&active-document=5&active-tab=settings-site-identity';
		$this->assertEquals($expected_url, $step->get_cta_url());
	}

	public function test__step_is_completed_when_logo_is_set() {
		$this->set_wordpress_adapter_mock( [ 'has_custom_logo' ], [
			'has_custom_logo' => true,
		] );

		$step = new Add_Logo( $this->checklist_module, $this->wordpress_adapter );
		$step->maybe_mark_as_completed();

		$this->assertTrue( $step->is_marked_as_completed() );
	}

}
