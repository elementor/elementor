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

	private $documents;

	private $uploads_manager_mock;

	private $uploads_manager;

	public function setUp(): void {
		parent::setUp();
		$this->documents = Plugin::$instance->documents;
		$this->cloud_library_app_mock = $this->getMockBuilder( '\Elementor\Modules\CloudLibrary\Connect\Cloud_Library' )
			->onlyMethods( [
				'get_resources',
				'get_resource',
				'post_resource',
				'update_resource',
				'delete_resource',
				'bulk_delete_resources',
				'get_bulk_resources_with_content',
				'bulk_move_templates',
				'post_bulk_resources',
				'get_quota',
			] )
			->disableOriginalConstructor()
			->getMock();

		$module_mock = $this->getMockBuilder( \Elementor\Core\Common\Modules\Connect\Module::class )
			->onlyMethods( [ 'get_app' ] )
			->getMock();

		$module_mock->method( 'get_app' )->willReturn( $this->cloud_library_app_mock );

		Plugin::$instance->common->add_component( 'connect', $module_mock );

		$this->manager = Plugin::$instance->templates_manager;

		$this->cloud_source_mock = $this->getMockBuilder( \Elementor\TemplateLibrary\Source_Cloud::class )
			->onlyMethods( [
				'send_file_headers',
				'serve_file',
				'get_item_children',
				'handle_zip_file',
				'filesize',
				'serve_zip',
				'replace_elements_ids',
				'bulk_delete_items',
				'prepare_import_template_data',
				'validate_quota',
			] )
			->disableOriginalConstructor()
			->getMock();

		$this->manager_mock = $this->getMockBuilder( \Elementor\TemplateLibrary\Manager::class )
			->onlyMethods( [ 'get_source' ] )
			->getMock();

		$this->manager_mock
			->method( 'get_source' )
			->willReturn( $this->cloud_source_mock );

		$this->uploads_manager_mock = $this->getMockBuilder('Elementor\Core\Files\Uploads_Manager')
			->onlyMethods( [ 'extract_and_validate_zip' ] )
			->disableOriginalConstructor()
			->getMock();

		$this->uploads_manager = Plugin::$instance->uploads_manager;
		Plugin::$instance->uploads_manager = $this->uploads_manager_mock;

		$reflection = new \ReflectionClass($this->cloud_source_mock);
		$save_document_method = $reflection->getMethod('save_document_for_preview');
		$save_document_method->setAccessible(true);
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->documents;
		Plugin::$instance->uploads_manager = $this->uploads_manager;
		parent::tearDown();
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

		$mock_content = [ 'content' => 'mock_content' ];
		$mock_post_resource_content = wp_json_encode( [ 'content' => $mock_content, 'page_settings' => [] ] );

		// Assert
		$this->cloud_library_app_mock
			->method( 'get_resource' )
			->with( [ 'id' => 1 ] );

		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'post_resource' )
			->with( [
				'title' => 'ATemplate',
				'type' => 'TEMPLATE',
				'templateType' => 'container',
				'parentId' => null,
				'content' => $mock_post_resource_content,
				'hasPageSettings' => false,
			] )
			->willReturn( $post_resource_response );

		// Act
		$this->manager->save_template( [
			'post_id' => 1,
			'source' => 'cloud',
			'title' => 'ATemplate',
			'type' => 'container',
			'resourceType' => 'TEMPLATE',
			'content' => wp_json_encode( $mock_content ),
			'parentId' => null,
		] );
	}

	public function test_rename_template() {
		// Arrange & Assert
		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'update_resource' )
			->with( [
				'source' => 'cloud',
				'title' => 'Updated Template Title',
				'id' => 1,
			] );

		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'get_resource' )
			->with( [ 'id' => 1 ] );

		// Act
		$this->manager->rename_template( [
			'source' => 'cloud',
			'title' => 'Updated Template Title',
			'id' => 1,
		] );
	}

	public function test_rename_template__should_throw_error_when_failed_to_update_resource() {
		// Arrange & Assert
		$this->cloud_library_app_mock
			->method( 'update_resource' )
			->with( [
				'source' => 'cloud',
				'title' => 'Updated Template Title',
				'id' => 1,
			] )
			->willReturn( new \WP_Error( 'update_error', 'An error has occured' ) );

		// Act & Assert
		$this->assertWPError( $this->manager->rename_template( [
			'source' => 'cloud',
			'title' => 'Updated Template Title',
			'id' => 1,
		] ) );
	}

	public function test_get_template_data() {
		// Arrange
		$template_id = 1;
		$template_content = [
			'content' => [
				'id' => 'test',
				'elType' => 'section',
			],
		];
		$template_data = [
			'id' => $template_id,
			'title' => 'Template 1',
			'type' => 'TEMPLATE',
			'parentId' => null,
			'templateType' => 'container',
			'content' => json_encode( $template_content ),
		];

		$this->cloud_library_app_mock
			->method('get_resource')
			->with( [ 'id' => $template_id ] )
			->willReturn( $template_data );

		// Act
		$result = $this->manager->get_template_data( [ 'source' => 'cloud', 'template_id' => $template_id ] );

		// Assert
		$this->assertArrayHasKey( 'id', $result );
		$this->assertArrayHasKey( 'title', $result );
		$this->assertArrayHasKey( 'type', $result );
		$this->assertArrayHasKey( 'templateType', $result );
		$this->assertArrayHasKey( 'content', $result );
	}

	public function test_delete_template() {
		// Arrange
		$template_id = 1;

		$this->cloud_library_app_mock
			->method( 'delete_resource' )
			->with( $template_id )
			->willReturn( true );

		// Act
		$result = $this->manager->delete_template( [ 'source' => 'cloud', 'template_id' => $template_id ] );

		// Assert
		$this->assertTrue( $result );

	}

	public function test_delete_template__should_return_false_when_failed() {
		// Arrange
		$template_id = 'not exist';

		$this->cloud_library_app_mock
			->method( 'delete_resource' )
			->with( $template_id )
			->willReturn( false );

		// Act
		$result = $this->manager->delete_template( [ 'source' => 'cloud', 'template_id' => $template_id ] );

		// Assert
		$this->assertFalse( $result );

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
		$folder = [
			'id' => 123,
			'title' => 'Folder 1',
			'type' => 'FOLDER',
			'parentId' => null,
			'templateType' => 'folder',
		];

		$this->cloud_library_app_mock
			->method( 'get_resource' )
			->willReturnCallback( function ( $args ) use ( $folder ) {
				$data = [
					123 => $folder,
					101 => [
						'id' => 101,
						'title' => 'Header Template',
						'type' => 'TEMPLATE',
						'parentId' => $folder['id'],
						'templateType' => 'container',
						'content' => '{"content":"value"}',
					],
					102 => [
						'id' => 102,
						'title' => 'Footer Template',
						'type' => 'TEMPLATE',
						'parentId' => $folder['id'],
						'templateType' => 'container',
						'content' => '{"content":"value"}',
					],
					103 => [
						'id' => 103,
						'title' => 'Sidebar Template',
						'type' => 'TEMPLATE',
						'parentId' => $folder['id'],
						'templateType' => 'container',
						'content' => '{"content":"value"}',
					],
				];

				return $data[ $args['id'] ] ?? [];
			}
			);

		$this->cloud_source_mock->method( 'get_item_children' )->willReturn(
			[
				'templates' => [
					[
						'template_id' => 101,
						'title' => 'Header Template',
						'type' => 'TEMPLATE',
						'parentId' => $folder['id'],
						'templateType' => 'container'
					],
					[
						'template_id' => 102,
						'title' => 'Footer Template',
						'type' => 'TEMPLATE',
						'parentId' => $folder['id'],
						'templateType' => 'container'
					],
					[
						'template_id' => 103,
						'title' => 'Sidebar Template',
						'type' => 'TEMPLATE',
						'parentId' => $folder['id'],
						'templateType' => 'container'
					],
				],
				'total' => 3,
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
		$result = $this->manager_mock->export_template( [ 'source' => 'cloud', 'template_id' => $folder['id'] ] );
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

	public function test_create_folder() {
		// Arrange
		$folder_data = [
			'title' => 'Folder 1',
			'source' => 'cloud',
		];

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'post_resource' )
			->with( [
				'title' => 'Folder 1',
				'type' => 'FOLDER',
				'parentId' => null,
				'templateType' => 'folder',
			] )
			->willReturn( [ 'id' => 1 ] );

		// Act
		$this->manager->create_folder( $folder_data );
	}

	public function test_get_folders() {
		// Arrange
		$args = [
			'source' => 'cloud',
			'templateType' => 'folder',
			'offset' => 0,
		];

		$this->cloud_library_app_mock
			->method( 'get_resources' )
			->willReturn( [] );

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'get_resources' )
			->with( $args );

		// Act
		$this->manager->get_folders( [ 'source' => 'cloud', 'offset' => 0 ] );
	}

	public function test_get_folders_fails_without_offset() {
		// Act
		$result = $this->manager->get_folders( [ 'source' => 'cloud' ] );

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->never() )
			->method( 'get_resources' );

		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "offset" not specified.', $result->get_error_message() );
	}

	public function test_get_folders_fails_without_source() {
		// Act
		$result = $this->manager->get_folders( [ 'offset' => 0 ] );

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->never() )
			->method( 'get_resources' );

		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "source" not specified.', $result->get_error_message() );
	}

	public function test_move_template() {
		// Arrange
		$mock_content = [ 'content' => 'mock_content' ];

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'update_resource' )
			->with( [
				'id' => 1,
				'parentId' => 2,
				'title' => 'ATemplate',
			] );

		// Act
		$this->manager->move_template( [
			'post_id' => 1,
			'source' => [ 'cloud' ],
			'title' => 'ATemplate',
			'type' => 'container',
			'resourceType' => 'TEMPLATE',
			'content' => wp_json_encode( $mock_content ),
			'parentId' => 2,
			'from_source' => 'cloud',
			'from_template_id' => 1,
		] );
	}

	public function test_move_template_fails_without_from_source() {
		// Arrange
		$mock_content = [ 'content' => 'mock_content' ];

		// Act
		$result = $this->manager->move_template( [
			'post_id' => 1,
			'source' => [ 'cloud' ],
			'title' => 'ATemplate',
			'type' => 'container',
			'resourceType' => 'TEMPLATE',
			'content' => wp_json_encode( $mock_content ),
			'parentId' => 2,
			'from_template_id' => 1,
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "from_source" not specified.', $result->get_error_message() );
	}

	public function test_move_template_fails_without_from_template_id() {
		// Arrange
		$mock_content = [ 'content' => 'mock_content' ];

		// Act
		$result = $this->manager->move_template( [
			'post_id' => 1,
			'source' => [ 'cloud' ],
			'title' => 'ATemplate',
			'type' => 'container',
			'resourceType' => 'TEMPLATE',
			'content' => wp_json_encode( $mock_content ),
			'parentId' => 2,
			'from_source' => 'cloud',
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "from_template_id" not specified.', $result->get_error_message() );
	}

	// new
	public function test_create_document_for_preview_without_permission() {
		// Arrange
		$this->act_as_subscriber();

		// Act
		$result = $this->cloud_source_mock->create_document_for_preview( 1 );

		// Assert
		$this->assertWPError( $result );
		$this->assertEquals( Exceptions::FORBIDDEN, $result->get_error_code() );
		$this->assertEquals( 'You do not have permission to create preview documents.', $result->get_error_message() );
	}

	public function test_create_document_for_preview_with_invalid_template() {
		// Arrange
		$this->act_as_admin();

		$this->cloud_library_app_mock->method( 'get_resource' )
			->with( [ 'id' => 1 ] )
			->willReturn( new \WP_Error( 'error', 'Template not found' ) );

		// Assert & Act
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Template not found' );
		$this->cloud_source_mock->create_document_for_preview( 1 );
	}

	public function test_create_document_for_preview_success() {
		// Arrange
		$this->act_as_admin();

		$this->cloud_source_mock->method( 'replace_elements_ids' )
			->willReturnCallback(function($content) {
				return $content;
			});

		$template_content = [
			'content' => [
				[
					'id' => 'test_id',
					'elType' => 'section',
					'elements' => []
				]
			],
			'page_settings' => [ 'test_settings' ]
		];

		$this->cloud_library_app_mock->method( 'get_resource' )
			->with( [ 'id' => 1 ] )
			->willReturn( [
				'content' => json_encode( $template_content )
			] );

		$mock_document = $this->getMockBuilder( '\Elementor\Core\Base\Document' )
			->disableOriginalConstructor()
			->getMock();

		$mock_document->method( 'get_main_id' )->willReturn( 123 );
		$mock_document->expects( $this->once() )
			->method( 'save' )
			->with( [
				'elements' => [
					[
						'id' => 'test_id',
						'elType' => 'section',
						'elements' => []
					]
				],
				'settings' => [ 'test_settings' ]
			] );

		$documents_mock = $this->getMockBuilder( '\Elementor\Core\Documents_Manager' )
			->disableOriginalConstructor()
			->getMock();

		$documents_mock->method( 'create' )
			->with(
				'cloud-template-preview',
				[
					'post_title' => '(no title)',
					'post_status' => 'draft'
				]
			)
			->willReturn( $mock_document );

		Plugin::$instance->documents = $documents_mock;

		// Act
		$result = $this->cloud_source_mock->create_document_for_preview(1);

		// Assert
		$this->assertInstanceOf( '\Elementor\Core\Base\Document', $result );
	}

	public function test_save_document_for_preview_success() {
		// Arrange
		$template_content = [
			'content' => [ 'test_content' ],
			'page_settings' => [ 'test_settings' ]
		];

		$mock_document = $this->getMockBuilder( '\Elementor\Core\Base\Document' )
			->disableOriginalConstructor()
			->getMock();

		$mock_document->method( 'get_main_id' )->willReturn( 123 );
		$mock_document->expects( $this->once() )
			->method( 'save' )
			->with( [
				'elements' => [ 'test_content' ],
				'settings' => [ 'test_settings' ]
			] );

		$documents_mock = $this->getMockBuilder( '\Elementor\Core\Documents_Manager' )
			->disableOriginalConstructor()
			->getMock();

		$documents_mock->method( 'create' )
			->with(
				'cloud-template-preview',
				[
					'post_title' => '(no title)',
					'post_status' => 'draft'
				]
			)
			->willReturn( $mock_document );

		Plugin::$instance->documents = $documents_mock;

		$this->cloud_source_mock->method( 'replace_elements_ids' )
			->willReturn( [ 'test_content' ] );

		$reflection = new \ReflectionClass( $this->cloud_source_mock );
		$method = $reflection->getMethod( 'save_document_for_preview' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $this->cloud_source_mock, $template_content );

		// Assert
		$this->assertInstanceOf( '\Elementor\Core\Base\Document', $result );
	}

	public function test_bulk_delete_templates() {
		// Arrange
		$template_ids = [ 1, 2, 3 ];

		$this->cloud_library_app_mock
			->method( 'bulk_delete_resources' )
			->with( $template_ids )
			->willReturn( true );

		// Act
		$result = $this->manager->bulk_delete_templates( [ 'source' => 'cloud', 'template_ids' => $template_ids ] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_bulk_delete_templates__should_return_false_when_failed() {
		// Arrange
		$template_ids = [ 1, 2, 3 ];

		$this->cloud_library_app_mock
			->method( 'bulk_delete_resources' )
			->with( $template_ids )
			->willReturn( new \WP_Error( 'bulk_delete_error', 'Failed to delete items' ) );

		// Act
		$result = $this->manager->bulk_delete_templates( [ 'source' => 'cloud', 'template_ids' => $template_ids ] );

		// Assert
		$this->assertWPError( $result );
	}

	public function test_bulk_move_templates() {
		// Arrange
		$this->cloud_library_app_mock
			->method( 'get_bulk_resources_with_content' )
			->with( [
				'from_template_id' => [ 1, 2 ],
			] )
			->willReturn( [
				[
					'template_id' => 1,
					'source' => 'cloud',
					'type' => 'TEMPLATE',
					'subType' => 'container',
					'title' => 'template 1',
					'content' => wp_json_encode( [ 'content' => 'mock_content' ] ),
				],
				[
					'template_id' => 2,
					'source' => 'cloud',
					'type' => 'TEMPLATE',
					'subType' => 'page',
					'title' => 'template 2',
					'content' => wp_json_encode( [ 'content' => 'mock_content_2' ] ),
				]
			] );

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'bulk_move_templates' )
			->with( [
				'ids' => [ 1, 2 ],
				'parentId' => null,
			] );

		// Act
		$this->manager->bulk_move_templates( [
			'source' => [ 'cloud' ],
			'from_source' => 'cloud',
			'from_template_id' => [ 1, 2 ],
		] );
	}

	public function test_bulk_move_templates_fails_without_source() {
		// Act
		$result = $this->manager->bulk_move_templates( [
			'from_source' => 'cloud',
			'from_template_id' => [ 1, 2 ],
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "source" not specified.', $result->get_error_message() );
	}

	public function test_bulk_move_templates_fails_without_from_source() {
		// Act
		$result =$this->manager->bulk_move_templates( [
			'source' => [ 'cloud' ],
			'from_template_id' => [ 1, 2 ],
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "from_source" not specified.', $result->get_error_message() );
	}

	public function test_bulk_move_templates_fails_without_from_template_id() {
		// Act
		$result = $this->manager->bulk_move_templates( [
			'source' => [ 'cloud' ],
			'from_source' => 'cloud',
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "from_template_id" not specified.', $result->get_error_message() );
	}

	public function test_bulk_copy_templates() {
		// Arrange
		$this->cloud_library_app_mock
			->method( 'get_bulk_resources_with_content' )
			->with( [
				'from_template_id' => [ 1, 2 ],
				'source' => 'cloud',
        		'from_source' => 'cloud',
			] )
			->willReturn( [
				[
					'template_id' => 1,
					'source' => 'cloud',
					'type' => 'TEMPLATE',
					'subType' => 'container',
					'title' => 'template 1',
					'content' => wp_json_encode( [ 'content' => 'mock_content', 'page_settings' => [] ] ),
				],
				[
					'template_id' => 2,
					'source' => 'cloud',
					'type' => 'TEMPLATE',
					'subType' => 'page',
					'title' => 'template 2',
					'content' => wp_json_encode( [ 'content' => 'mock_content_2', 'page_settings' => [] ] ),
				]
			] );

		$this->cloud_source_mock
			->method( 'validate_quota' )
			->willReturn( true );

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'post_bulk_resources' );

		// Act
		$this->manager->bulk_copy_templates( [
			'source' => [ 'cloud' ],
			'from_source' => 'cloud',
			'from_template_id' => [ 1, 2 ],
		] );
	}

	public function test_bulk_copy_templates_fails_without_source() {
		// Act
		$result = $this->manager->bulk_copy_templates( [
			'from_source' => 'cloud',
			'from_template_id' => [ 1, 2 ],
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "source" not specified.', $result->get_error_message() );
	}

	public function test_bulk_copy_templates_fails_without_from_source() {
		// Act
		$result =$this->manager->bulk_copy_templates( [
			'source' => [ 'cloud' ],
			'from_template_id' => [ 1, 2 ],
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "from_source" not specified.', $result->get_error_message() );
	}

	public function test_bulk_copy_templates_fails_without_from_template_id() {
		// Act
		$result = $this->manager->bulk_copy_templates( [
			'source' => [ 'cloud' ],
			'from_source' => 'cloud',
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "from_template_id" not specified.', $result->get_error_message() );
	}

	public function test_copy_template() {
		// Arrange
		$mock_content = [ 'content' => 'mock_content', 'page_settings' => [] ];
		$saved_template_data = [
			'id' => 1,
			'parentId' => 2,
			'type' => 'TEMPLATE',
			'subType' => 'container',
			'title' => 'template 1',
			'content' => wp_json_encode( $mock_content ),
		];

		$this->cloud_library_app_mock
			->method( 'get_resource' )
			->with( [
				'id' => 1,
			] )
			->willReturn( $saved_template_data );

		$this->cloud_library_app_mock
			->method( 'post_resource' )
			->willReturn( $saved_template_data );

		// Assert
		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'post_resource' )
			->with( [
				'parentId' => 2,
				'title' => 'ATemplate',
				'type' => 'TEMPLATE',
				'templateType' => 'container',
				'content' => wp_json_encode( $mock_content ),
				'hasPageSettings' => false,
			] );

		// Act
		$this->manager->copy_template( [
			'post_id' => 1,
			'source' => [ 'cloud' ],
			'title' => 'ATemplate',
			'type' => 'container',
			'resourceType' => 'TEMPLATE',
			'content' => wp_json_encode( $mock_content ),
			'parentId' => 2,
			'from_source' => 'cloud',
			'from_template_id' => 1,
		] );
	}

	public function test_copy_templates_fails_without_from_source() {
		// Act
		$result =$this->manager->copy_template( [
			'source' => [ 'cloud' ],
			'from_template_id' => [ 1, 2 ],
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "from_source" not specified.', $result->get_error_message() );
	}

	public function test_copy_templates_fails_without_from_template_id() {
		// Act
		$result = $this->manager->copy_template( [
			'source' => [ 'cloud' ],
			'from_source' => 'cloud',
		] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "from_template_id" not specified.', $result->get_error_message() );
	}

	public function test_get_templates_quota() {
		// Assert
		$this->cloud_library_app_mock
			->expects( $this->once() )
			->method( 'get_quota' );

		// Act
		$this->manager->get_templates_quota( [
			'source' => 'cloud',
		] );
	}

	public function test_get_templates_quota_fails_without_source() {
		// Act
		$result = $this->manager->get_templates_quota( [] );

		// Assert
		$this->assertWPError( $result );

		$this->assertEquals( 'The required argument(s) "source" not specified.', $result->get_error_message() );
	}

	public function test_import_template_with_empty_path() {
		// Act
		$result = $this->cloud_source_mock->import_template('test.json', '');

		// Assert
		$this->assertWPError($result);
		$this->assertEquals('file_error', $result->get_error_code());
		$this->assertEquals('Please upload a file to import', $result->get_error_message());
	}

	public function test_import_template_with_quota_exceeded() {
		// Arrange
		$template_data = [
			'content' => [ 'test_content' ],
			'page_settings' => [ 'test_settings' ],
			'title' => 'Test Template',
			'type' => 'container'
		];

		$this->cloud_library_app_mock
			->method( 'get_quota' )
			->willReturn( [
				'currentUsage' => 100,
				'threshold' => 100
			] );

		$this->cloud_source_mock
			->method( 'prepare_import_template_data' )
			->willReturn($template_data);

		// Act
		$result = $this->cloud_source_mock->import_template( 'test.json', 'path/to/file' );

		// Assert
		$this->assertWPError( $result );
		$this->assertEquals( 'quota_error', $result->get_error_code() );
		$this->assertEquals( 'The upload failed because you’ve saved the maximum templates already.', $result->get_error_message() );
	}

	public function test_import_template_single_file_success() {
		// Arrange
		$template_data = [
			'content' => [ 'test_content' ],
			'page_settings' => [ 'test_settings' ],
			'title' => 'Test Template',
			'type' => 'container'
		];

		$mock_file_path = 'path/to/template.json';

		$this->cloud_library_app_mock
			->method( 'get_quota' )
			->willReturn( [
				'currentUsage' => 0,
				'threshold' => 100
			] );

		$this->cloud_source_mock
			->method( 'validate_quota' )
			->willReturn( true );

		$this->cloud_source_mock
			->method( 'prepare_import_template_data' )
			->with( $mock_file_path )
			->willReturn( $template_data );

		$this->cloud_library_app_mock
			->method( 'post_resource' )
			->willReturn( [ 'id' => 1 ] );

		// Act
		$result = $this->cloud_source_mock->import_template( 'template.json', $mock_file_path );

		// Assert
		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertEquals( 1, $result[0]['id'] );
	}

	public function test_import_template_zip_file_success() {
		// Arrange
		$template_data1 = [
			'content' => [ 'test_content1' ],
			'page_settings' => [ 'test_settings1' ],
			'title' => 'Test Template 1',
			'type' => 'container'
		];

		$template_data2 = [
			'content' => [ 'test_content2' ],
			'page_settings' => [ 'test_settings2' ],
			'title' => 'Test Template 2',
			'type' => 'container'
		];

		$mock_zip_path = 'path/to/templates.zip';

		$mock_extracted_files = [
			'extraction_directory' => 'path/to/extracted',
			'files' => [
				'path/to/template1.json',
				'path/to/template2.json'
			]
		];

		$this->cloud_library_app_mock
			->method( 'get_quota' )
			->willReturn( [
				'currentUsage' => 0,
				'threshold' => 100
			] );

		$this->cloud_source_mock
			->method( 'validate_quota' )
			->willReturn( true );

		$this->cloud_source_mock
			->method( 'prepare_import_template_data' )
			->willReturnCallback( function( $path ) use ( $template_data1, $template_data2 ) {
				if ( 'path/to/template1.json' === $path ) {
					return $template_data1;
				}
				return $template_data2;
			});

		$this->cloud_library_app_mock
			->method( 'post_bulk_resources' )
			->willReturn( [
				[ 'id' => 1 ],
				[ 'id' => 2 ]
			] );

		$this->uploads_manager_mock
			->method( 'extract_and_validate_zip' )
			->with( $mock_zip_path, [ 'json' ] )
			->willReturn( $mock_extracted_files );

		// Act
		$result = $this->cloud_source_mock->import_template( 'templates.zip', $mock_zip_path );

		// Assert
		$this->assertIsArray( $result );
		$this->assertCount( 2, $result );
		$this->assertEquals( 1, $result[0]['id'] );
		$this->assertEquals( 2, $result[1]['id'] );
	}

	public function test_import_template_zip_file_with_quota_exceeded() {
		// Arrange
		$mock_zip_path = 'path/to/templates.zip';
		$mock_extracted_files = [
			'extraction_directory' => 'path/to/extracted',
			'files' => [
				'path/to/template1.json',
				'path/to/template2.json'
			]
		];

		$this->uploads_manager_mock
			->method( 'extract_and_validate_zip' )
			->with( $mock_zip_path, [ 'json' ] )
			->willReturn( $mock_extracted_files );

		$this->cloud_library_app_mock
			->method( 'get_quota' )
			->willReturn( [
				'currentUsage' => 99,
				'threshold' => 100
			] );

		$this->cloud_source_mock
			->method( 'prepare_import_template_data' )
			->willReturn( [
				'content' => [ 'test_content' ],
				'page_settings' => [ 'test_settings' ],
				'title' => 'Test Template',
				'type' => 'container'
			] );

		// Act
		$result = $this->cloud_source_mock->import_template( 'templates.zip', $mock_zip_path );

		// Assert
		$this->assertWPError( $result );
		$this->assertEquals( 'quota_error', $result->get_error_code() );
		$this->assertEquals( 'The upload failed because it will pass the maximum templates you can save.', $result->get_error_message() );
	}

	public function test_import_template_with_invalid_file() {
		// Arrange
		$mock_file_path = 'path/to/invalid.json';

		$this->cloud_library_app_mock
			->method( 'get_quota' )
			->willReturn( [
				'currentUsage' => 0,
				'threshold' => 100
			] );

		$this->cloud_source_mock
			->method( 'prepare_import_template_data' )
			->with( $mock_file_path )
			->willReturn( new \WP_Error( 'invalid_file', 'Invalid template file' ) );

		// Act
		$result = $this->cloud_source_mock->import_template( 'invalid.json', $mock_file_path );

		// Assert
		$this->assertWPError( $result );
		$this->assertEquals( 'invalid_file', $result->get_error_code() );
		$this->assertEquals( 'Invalid template file', $result->get_error_message() );
	}
}
