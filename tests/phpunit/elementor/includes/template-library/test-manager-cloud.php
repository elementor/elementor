<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Manager_Cloud extends Elementor_Test_Base {
	/**
	 * @var \Elementor\TemplateLibrary\Manager
	 */
	protected $manager;

	private $cloud_library_app_mock;

	public function setUp(): void {
		parent::setUp();
		$this->cloud_library_app_mock = $this->getMockBuilder( '\Elementor\Modules\CloudLibrary\Connect\Cloud_Library' )
			->onlyMethods( [ 'get_resources' ] )
			->disableOriginalConstructor()
			->getMock();

		$module_mock = $this->getMockBuilder( \Elementor\Core\Common\Modules\Connect\Module::class )
			->onlyMethods( [ 'get_app' ] )
			->getMock();

		$module_mock->method( 'get_app' )->willReturn( $this->cloud_library_app_mock );

		Plugin::$instance->common->add_component( 'connect', $module_mock );

		$this->manager = Plugin::$instance->templates_manager;
	}

	public function test_should_return_cloud_source() {
		$this->assertInstanceOf( '\Elementor\TemplateLibrary\Source_Cloud', $this->manager->get_source( 'cloud' ) );
	}

	public function test_should_call_get_resources() {
		// Arrange
		$this->cloud_library_app_mock
			->method('get_resources')
			->willReturn([]);

		// Assert
		$this->cloud_library_app_mock
			->expects($this->once())
			->method('get_resources')
			->with([ 'force_update' => false]);

		// Act
		$this->manager->get_templates(['cloud']);
	}
}
