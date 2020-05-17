<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base;

use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Simple\Controller as ControllerSimple;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller as ControllerTemplate;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Processor\Controller as ControllerWithProcessor;


class Test_Controller extends Elementor_Test_Base {

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

	public function test_create_simple() {
		$controller = new ControllerSimple( $this );

		do_action( 'rest_api_init' ); // Ensure controller loaded.

		$rest_index = Manager::run_endpoint( $controller->get_name() );
		$rest_routes = $rest_index['routes'];

		$this->assertArrayHaveKeys( [ '/' . $controller->get_controller_route() ], $rest_routes,
		'Validate `$this->register_internal_endpoints();`.' );

		foreach ( $controller->endpoints as $endpoint ) {
			$this->assertArrayHaveKeys( [ '/' . $controller->get_controller_route() . '/' . $endpoint->get_name() ], $rest_routes,
				'Validate `$this->register_endpoints();`.' );
		}
	}

	public function test_get_processors() {
		// Validate Also `$register_processors();`.

		$controller = new ControllerWithProcessor( $this );

		do_action( 'rest_api_init' ); // Ensure controller loaded.

		$processors = $controller->get_processors( $controller->get_name() );

		$this->assertEquals( $controller::$fake_processor_instance, $processors[ 0 ] );
	}

	public function test_get_items() {
		$controller = new ControllerTemplate( $this );

		$data = $controller->get_items( null )->get_data();

		$controller_pure_name = str_replace( $data['namespace'] . '/',  '',  $data['controller'] );

		$this->assertEquals( $controller->get_name(), $controller_pure_name );
	}

	public function test_get_controller_index() {
		$controller = new ControllerTemplate( $this );

		$data = $controller->get_controller_index()->get_data();

		$controller_pure_name = str_replace( $data['namespace'] . '/',  '',  $data['controller'] );

		$this->assertEquals( $controller->get_name(), $controller_pure_name );
	}

	public function test_register_endpoint_format() {
		$controller = new ControllerTemplate( $this );

		$controller->register_endpoint_format( 'test-command', 'test-format' );

		$this->assertEquals( 'test-format', $controller->command_formats[ 'test-command' ] );
	}
}
