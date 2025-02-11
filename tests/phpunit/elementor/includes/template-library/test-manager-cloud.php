<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Core\Utils\Exceptions;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\DB;

class Elementor_Test_Manager_Cloud extends Elementor_Test_Base {
	/**
	 * @var \Elementor\TemplateLibrary\Manager
	 */
	protected $manager;

	private $cloud_library_app_mock;

	private $cloud_source_mock;

	private $manager_mock;

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

		$this->cloud_source_mock = $this->getMockBuilder( \Elementor\TemplateLibrary\Source_Cloud::class )
			->onlyMethods( [ 'send_file_headers', 'serve_file', 'get_item_children', 'handle_zip_file', 'filesize', 'serve_zip' ] )
			->disableOriginalConstructor()
			->getMock();

		$this->manager_mock = $this->getMockBuilder( \Elementor\TemplateLibrary\Manager::class )
			->onlyMethods( [ 'get_source' ] )
			->getMock();

		$this->manager_mock
			->method( 'get_source' )
			->willReturn( $this->cloud_source_mock );
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

	public function test_export_template__template_type() {
		// Arrange
		$data = [
			'id' => 456,
			'title' => 'Template 1',
			'type' => 'TEMPLATE',
			'parentId' => null,
			'templateType' => 'container',
			'content' => json_encode(['content' => 'mock_content']),
		];

		$expected_file_content = '{"content":"mock_content","page_settings":[],"version":"'.DB::DB_VERSION.'","title":"Template 1","type":"container"}';
		$expected_file_name = 'elementor-' . $data['id'] . '-' . gmdate( 'Y-m-d' ) . '.json';

		$this->cloud_library_app_mock->method( 'get_resource' )->willReturn( $data );

		// Assert
		$this->cloud_source_mock
			->expects( $this->once() )
			->method( 'send_file_headers' )
			->with( $this->equalTo( $expected_file_name ), $this->equalTo( strlen( $expected_file_content ) ) );

		$this->cloud_source_mock
			->expects( $this->once() )
			->method( 'serve_file' )
			->with( $this->equalTo( $expected_file_content ) );

		// Act
		$result = $this->manager_mock->export_template( [ 'source' => 'cloud', 'template_id' => $data['id'] ] );
	}

	public function test_export_template__folder_type() {
		// Arrange
		$data = [
			'id' => 123,
			'title' => 'Folder 1',
			'type' => 'FOLDER',
			'parentId' => null,
			'templateType' => 'folder',
		];

		$this->cloud_library_app_mock->method( 'get_resource' )->willReturn( $data );
		$this->cloud_source_mock->method( 'get_item_children' )->willReturn(
			[
				[
					'template_id' => 101,
					'title' => 'Header Template',
					'type' => 'TEMPLATE',
					'parentId' => $data['id'],
					'templateType' => 'container'
				],
				[
					'template_id' => 102,
					'title' => 'Footer Template',
					'type' => 'TEMPLATE',
					'parentId' => $data['id'],
					'templateType' => 'container'
				],
				[
					'template_id' => 103,
					'title' => 'Sidebar Template',
					'type' => 'TEMPLATE',
					'parentId' => $data['id'],
					'templateType' => 'container'
				],
			]
		);

		$zip_archive_filename = 'zip-file.zip';
		$zip_complete_path = 'some/dir/name';
		$mocked_file_size = 12345;

		// Assert
		$this->cloud_source_mock
			->method( 'handle_zip_file' )
			->willReturn( [ $zip_archive_filename, $zip_complete_path ] );

		$this->cloud_source_mock
			->method( 'filesize' )
			->with( $zip_complete_path )
			->willReturn( $mocked_file_size );

		$this->cloud_source_mock
			->expects( $this->once() )
			->method( 'send_file_headers' )
			->with(
				$this->equalTo( $zip_archive_filename ),
				$this->equalTo( $mocked_file_size )
			);

		$this->cloud_source_mock
			->expects( $this->once() )
			->method( 'serve_zip' )
			->with( $this->equalTo( $zip_complete_path ) );

		// Act
		$result = $this->manager_mock->export_template( [ 'source' => 'cloud', 'template_id' => $data['id'] ] );
	}

	public function test_load_more_templates() {
		// Arrange
		$args = [
			'offset' => 10,
			'search' => 'search',
			'source' => 'cloud',
		];

		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method('get_resources')
			->with($args);
		// Act
		$this->manager->load_more_templates($args);
	}

	public function test_load_more_templates_fails_without_source() {
		// Arrange
		$args = [
			'search' => 'search',
			'offset' => 10,
		];

		// Act
		$result = $this->manager->load_more_templates($args);

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->never() )
			->method('get_resources');

		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "source" not specified.', $result->get_error_message() );
	}

	public function test_load_more_templates_fails_without_offset() {
		// Arrange
		$args = [
			'search' => 'search',
			'source' => 'cloud',
		];

		// Act
		$result = $this->manager->load_more_templates( $args );

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->never() )
			->method('get_resources');

		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "offset" not specified.', $result->get_error_message() );
	}
}
