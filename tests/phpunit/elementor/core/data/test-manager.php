<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Data;

use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller as ControllerTemplate;

class Test_Manager extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Data\Manager
	 */
	protected $manager;

	public function setUp() {
		parent::setUp();

		$this->manager = Manager::instance();
		$this->manager->kill_server();
	}

	public function test_register_endpoint_format() {
		$controller = new ControllerTemplate();

		$this->manager->register_endpoint_format( 'test-command', 'test-command/{test-format}' );

		$this->assertEquals( 'test-command/{test-format}', $this->manager->command_formats['test-command'] );
	}

	public function test_command_to_endpoint() {
		$one_parameter = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/endpoint/{paramA}', [
			'paramA' => 'valueA',
		] );
		$this->assertEquals( 'controller/endpoint/valueA', $one_parameter );

		$one_parameter = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/{paramA}/endpoint', [
			'paramA' => 'valueA',
		] );
		$this->assertEquals( 'controller/valueA/endpoint', $one_parameter );

		$one_parameter = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/{paramA}/endpoint/whatever', [
			'paramA' => 'valueA',
		] );
		$this->assertEquals( 'controller/valueA/endpoint/whatever', $one_parameter );

		$one_parameter = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/whatever/{paramA}/endpoint', [
			'paramA' => 'valueA',
		] );
		$this->assertEquals( 'controller/whatever/valueA/endpoint', $one_parameter );

		$one_parameter = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/{paramA}/whatever/endpoint', [
			'paramA' => 'valueA',
		] );
		$this->assertEquals( 'controller/valueA/whatever/endpoint', $one_parameter );

		$two_parameter = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/{paramA}/endpoint/{paramB}', [
			'paramA' => 'valueA',
			'paramB' => 'valueB',
		] );
		$this->assertEquals( 'controller/valueA/endpoint/valueB', $two_parameter );

		$two_parameter = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/{paramA}/{paramB}/endpoint', [
			'paramA' => 'valueA',
			'paramB' => 'valueB',
		] );
		$this->assertEquals( 'controller/valueA/valueB/endpoint', $two_parameter );

		$two_parameter = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/endpoint/{paramA}/{paramB}', [
			'paramA' => 'valueA',
			'paramB' => 'valueB',
		] );
		$this->assertEquals( 'controller/endpoint/valueA/valueB', $two_parameter );

		$two_parameter = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/endpoint/{paramA}/try-hard/{paramB}', [
			'paramA' => 'valueA',
			'paramB' => 'valueB',
		] );
		$this->assertEquals( 'controller/endpoint/valueA/try-hard/valueB', $two_parameter );

		$two_parameter_second_missing = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/{paramA}/endpoint/{paramB}', [
			'paramA' => 'valueA',
		] );
		$this->assertEquals( 'controller/valueA/endpoint', $two_parameter_second_missing );

		$two_parameter_second_missing = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/{paramA}/{paramB}/endpoint', [
			'paramA' => 'valueA',
		] );
		$this->assertEquals( 'controller/valueA', $two_parameter_second_missing );

		$two_parameter_second_missing = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/endpoint/{paramA}/{paramB}', [
			'paramA' => 'valueA',
		] );
		$this->assertEquals( 'controller/endpoint/valueA', $two_parameter_second_missing );

		$two_parameter_second_missing = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/endpoint/{paramA}/try-hard/{paramB}', [
			'paramA' => 'valueA',
		] );
		$this->assertEquals( 'controller/endpoint/valueA/try-hard', $two_parameter_second_missing );

		$two_parameters_first_missing = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/{paramA}/endpoint/{paramB}', [
			'paramB' => 'valueB',
		] );
		$this->assertEquals( 'controller', $two_parameters_first_missing );

		$two_parameters_first_missing = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/{paramA}/{paramB}/endpoint', [
			'paramB' => 'valueB',
		] );
		$this->assertEquals( 'controller', $two_parameters_first_missing );

		$two_parameters_first_missing = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/endpoint/{paramA}/{paramB}', [
			'paramB' => 'valueB',
		] );
		$this->assertEquals( 'controller/endpoint', $two_parameters_first_missing );

		$two_parameters_first_missing = $this->manager->command_to_endpoint( 'controller/endpoint', 'controller/endpoint/{paramA}/try-hard/{paramB}', [
			'paramB' => 'valueB',
		] );
		$this->assertEquals( 'controller/endpoint', $two_parameters_first_missing );
	}

	public function test_commands_formats() {
		$this->manager->run_server();

		$this->assertEquals( [
			'editor/documents/elements' => 'editor/documents/{document_id}/elements/{element_id}',
			'editor/documents/index' => 'editor/documents/index/{document_id}',
			'globals/index' => 'globals/index',
			'globals/colors' => 'globals/colors',
			'globals/typography' => 'globals/typography',
		], $this->manager->command_formats );
	}
}
