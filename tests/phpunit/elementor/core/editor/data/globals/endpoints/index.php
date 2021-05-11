<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Core\Editor\Data;

class Test_Index extends Base  {
	public function get_command() {
		return 'globals';
	}

	public function get_controller_class() {
		return Data\Globals\Controller::class;
	}

	public function test_index() {
		$test_colors = new Test_Colors();
		$test_typography = new Test_Typography();

		$test_colors->set_manager( $this->get_manager() );
		$test_typography->set_manager( $this->get_manager() );

		$test_colors->test_create();
		$test_typography->test_create();

		$colors = $this->manager->run_endpoint( $test_colors->get_endpoint() );
		$typography = $this->manager->run_endpoint( $test_typography->get_endpoint() );

		$result = $this->manager->run_endpoint( $this->get_endpoint() ); // run index.
		$excepted = [
			'colors' => $colors,
			'typography' => $typography,
		];

		$this->assertEquals( $excepted, $result );
	}
}
