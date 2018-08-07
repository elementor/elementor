<?php
namespace Elementor\Testing\Modules\Library;

use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Module extends Elementor_Test_Base {

	public function test_should_return_library() {
		$this->assertEquals( 'library', ( new \Elementor\Modules\Library\Module() )->get_name() );
	}

	public function test_should_localize_settings() {
		$this->assertEquals(
			[
				'i18n' => [],
			], ( new \Elementor\Modules\Library\Module() )->localize_settings( [] )
		);
	}

}
