<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Create_Pages_Step_Test extends Step_Test_Base {
	public function test_is_done() {
		$this->assertTrue( $this->step->is_done() );
	}

	public function test_check__asert_true() {
		$this->step->mark_as_done();

		$this->assertTrue( $this->step->is_done() );
	}

	public function setUp(): void {
		$this->set_wordpress_adapter_mock( [ 'get_pages' ], [
			'get_pages' => 3,
		] );

		parent::setUp();
	}
}
