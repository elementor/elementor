<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Core\Utils\Exceptions;
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
			->onlyMethods( [ 'get_resources', 'get_resource', 'post_resource' ] )
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


	public function test_should_throw_error_if_app_is_not_registered() {
		// Arrange
		$module_mock = $this->getMockBuilder( \Elementor\Core\Common\Modules\Connect\Module::class )
			->onlyMethods( [ 'get_app' ] )
			->getMock();

		$module_mock->method( 'get_app' )->willReturn( null );

		Plugin::$instance->common->add_component( 'connect', $module_mock );

		// Assert

		$this->expectException( \Exception::class );
		$this->expectExceptionCode( Exceptions::FORBIDDEN );
		$this->expectExceptionMessage( 'Cloud-Library is not instantiated.' );

		// Act
		$this->manager->get_source( 'cloud' )->get_items();
	}

	public function test_get_templates_should_call_get_resources() {
		// Arrange
		$this->cloud_library_app_mock
			->method('get_resources')
			->willReturn([]);

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method('get_resources')
			->with([ 'force_update' => false]);

		// Act
		$this->manager->get_templates(['cloud']);
	}

	public function test_save_template() {
		// Arrange
		$post_resource_response = [
			"id" => 1,
			"createdAt" => "2025-01-21T10:45:32.541Z",
			"updatedAt" => "2025-01-21T10:45:32.541Z",
			"parentId" => null,
			"authorId" => "123",
			"authorEmail" => "mock@email.com",
			"title" => "AFolder",
			"type" => "FOLDER",
			"templateType" => "",
		];

		$mock_content = json_encode( ['content' => 'mock_content'] );

		// Assert
		$this->cloud_library_app_mock
			->method('post_resource')
			->willReturn($post_resource_response);

		$this->cloud_library_app_mock
			->method('get_resource')
			->with([ 'id' => 1 ]);

		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method('post_resource')
			->with([
				'title' => 'ATemplate',
				'type' => 'TEMPLATE',
				'templateType' => 'container',
				'parentId' => null,
				'content' => $mock_content,
			]);

		// Act
		$this->manager->save_template([
			'post_id' => 1,
			'source' => 'cloud',
			'title' => 'ATemplate',
			'type' => 'container',
			'resourceType' => 'TEMPLATE',
			'content' => $mock_content,
			'parentId' => null,
		]);
	}

	public function test_export_template__with_error() {
		// Arrange
        $this->cloud_library_app_mock
			->method( 'get_resource' )
			->willReturn( new \WP_Error( 'some_error', 'An error occurred' ) );

		// Act
        $result = $this->manager->export_template( 123 );

		// Assert
        $this->assertInstanceOf( \WP_Error::class, $result );
        $this->assertEquals( 'export_template_error', $result->get_error_code() );
    }
}
