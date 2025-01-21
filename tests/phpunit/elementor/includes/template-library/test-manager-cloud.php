<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Manager_Remote extends Elementor_Test_Base {
	/**
	 * @var \Elementor\TemplateLibrary\Manager
	 */
	protected static $manager;

	private $cloud_library_app_mock;

	public function setUp(): void {
		parent::setUp();
		$this->cloud_library_app_mock = $this->getMockBuilder( '\Elementor\Modules\CloudLibrary\Connect\Cloud_Library' )
			->disableOriginalConstructor()
			->getMock();

		$module_mock = $this->getMockBuilder( \Elementor\Core\Common\Modules\Connect\Module::class )
			->setMethods( [ 'get_app' ] )
			->getMock();

		$module_mock->method( 'get_app' )->willReturn( $this->ai_app_mock );

		Plugin::$instance->common->add_component( 'connect', $module_mock );
	}

	public static function setUpBeforeClass(): void {
		self::$manager = self::elementor()->templates_manager;
	}

	public function test_should_return_source() {
		$this->assertInstanceOf( '\Elementor\TemplateLibrary\Source_Cloud', self::$manager->get_source( 'cloud' ) );
	}

	public function test_should_call_get_resources() {
		self::$manager->get_templates([
			'source' => 'cloud'
		]);

		$this->cloud_library_app_mock->expects( $this->once() )
			->method( 'get_resources' )
			->with( [ ] );
	}
}
