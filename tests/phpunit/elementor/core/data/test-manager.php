<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Data;

use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;

class Test_Manager extends Elementor_Test_Base {
	public function test_commands_formats() {
		do_action( 'rest_api_init' );
		/**
		 * @var $manager \Elementor\Data\Manager
		 */
		$manager = Manager::instance();

		$controllers = $manager->get_controllers();

		$this->assertEquals( [
			'editor/documents/elements' => 'editor/documents/:document_id/elements/:element_id',
			'editor/documents/index' => 'editor/documents/index/:document_id',
		], $controllers['editor/documents']->command_formats );
	}
}
