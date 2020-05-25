<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Data;

use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;

class Test_Manager extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Data\Manager
	 */
	protected $manager;

	/**
	 * @var \WP_REST_Server
	 */
	protected $server;

	public function setUp() {
		parent::setUp();

		$this->manager = Manager::instance();
		$this->server = $this->manager->run_server();
	}

	public function test_commands_formats() {
		$controllers = $this->manager->get_controllers();

		$this->assertEquals( [
			'editor/documents/elements' => 'editor/documents/{document_id}/elements/{element_id}',
			'editor/documents/index' => 'editor/documents/index/{document_id}',
		], $controllers['editor/documents']->command_formats );
	}
}
