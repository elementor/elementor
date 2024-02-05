<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files;

use Elementor\Core\Files\File_Types\Base as File_Type_Base;
use Elementor\Core\Files\File_Types\Json;
use Elementor\Core\Files\Uploads_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Uploads_Manager extends Elementor_Test_Base {

	protected static $zip_file_name = 'test-zip.zip';
	protected static $temp_directory = '';
	protected static $template_json_file_name = 'test-template.json';
	protected static $base64_file_name = 'test-template-base64.json';

	protected static $file_types = [
		'json',
		'zip',
		'svg',
	];

	protected static $mock_template = [
		"content" => [
			[
				"id" => "204158c1",
				"settings" => [
					"section_layout" => "",
					"_title" => "hero section"
				],
				"elements" => [
					[
						"id" => "7a9669d9",
						"settings" => [
							"space_between_widgets" => "20"
						],
						"elements" => [
							[
								"id" => "3b2abfae",
								"settings" => [
									"section_title" => "",
									"title" => "workflow optimization made easy",
								],
								"elements" => [],
								"isInner" => false,
								"widgetType" => "heading",
								"elType" => "widget"
							],
							[
								"id" => "45eedfd7",
								"settings" => [
									"section_button" => "",
									"text" => "Get Started",
								],
								"elements" => [],
								"isInner" => false,
								"widgetType" => "button",
								"elType" => "widget"
							]
						],
						"isInner" => "",
						"elType" => "column"
					]
				],
				"isInner" => "",
				"elType" => "section"
			]
		],
		"page_settings" => [
			"background_background" => "classic",
			"background_color" => "#FFFFFF"
		],
		"version" => "0.4",
		"title" => "template mock",
		"type" => "page",
	];

	public static function setUpBeforeClass(): void {
		// In case tests get interrupted and the tearDown method doesn't run, we reset the files.
		self::$temp_directory = getcwd() . '/temp/';

		if ( file_exists( self::$temp_directory ) ) {
			self::tearDownAfterClass();
		}

		wp_mkdir_p( self::$temp_directory );

		$template_json = json_encode( self::$mock_template );

		file_put_contents( self::$temp_directory . self::$template_json_file_name, $template_json );
	}

	public static function tearDownAfterClass(): void {
		if ( is_dir( self::$temp_directory ) ) {
			// Remove all temporary files in the temporary directory
			array_map('unlink', glob(self::$temp_directory . '*.*' ) );

			// Now that it's empty, delete the temp directory itself.
			rmdir( self::$temp_directory );
		}
	}

	public function test_register_file_types() {
		// Test if the following keys exist in the Upload Manager's file type handlers array.
		$registered_file_type_handlers = Plugin::$instance->uploads_manager->get_file_type_handlers();

		foreach ( self::$file_types as $file_type ) {
			$this->assertTrue( array_key_exists( $file_type, $registered_file_type_handlers ) );
			$this->assertTrue( $registered_file_type_handlers[ $file_type ] instanceof File_Type_Base );
		}
	}

	public function test_get_file_type_handlers() {
		$file_type_handlers = Plugin::$instance->uploads_manager->get_file_type_handlers();

		// Test that get_file_type_handlers() returns an array.
		$this->assertTrue( is_array( $file_type_handlers ) );

		$are_all_array_items_handlers = true;

		// Test that all items in the array are really file type handlers.
		foreach ( $file_type_handlers as $file_type_handler ) {
			if ( ! $file_type_handler instanceof File_Type_Base ) {
				$are_all_array_items_handlers = false;

				break;
			}
		}

		$this->assertTrue( $are_all_array_items_handlers );

		// Test fetching a specific file type handler
		$json_handler = Plugin::$instance->uploads_manager->get_file_type_handlers( 'json' );

		$this->assertTrue( $json_handler instanceof Json );
	}

	public function test_extract_and_validate_zip() {
		if ( ! class_exists( '\ZipArchive' ) ) {
			throw new \Error( 'ZipArchive module is not installed on the server. You must install this module to perform the process.' );
		}

		// Make sure unfiltered uploads are allowed for this test.
		add_filter( 'elementor/files/allow_unfiltered_upload', function( $enabled ) {
			return true;
		} );

		// Create invalid file.
		$invalid_file_basename = 'invalid_file.php';
		$invalid_file_path = self::$temp_directory . $invalid_file_basename;

		file_put_contents( $invalid_file_path, '' );

		$valid_file_path = self::$temp_directory . self::$template_json_file_name;
		$zip_file_path = self::$temp_directory . self::$zip_file_name;
		$zip_file = new \ZipArchive();
		$zip_file->open( $zip_file_path, \ZipArchive::CREATE || \ZipArchive::OVERWRITE );

		// Add a template file.
		$zip_file->addFile( $valid_file_path, self::$template_json_file_name );

		// Add invalid file.
		$zip_file->addFile( $invalid_file_path, $invalid_file_basename );

		$zip_file->close();

		$result = Plugin::$instance->uploads_manager->extract_and_validate_zip( $zip_file_path, [ 'json' ] );

		$is_extract_successful = ! is_wp_error( $result ) && ! empty( $result['files'] );

		$this->assertTrue( $is_extract_successful );
		$this->assertCount( 1, $result['files'] );
		$this->assertEquals( $result['extraction_directory'] . self::$template_json_file_name, $result['files'][0] );
		$this->assertTrue( file_exists( $result['extraction_directory'] . self::$template_json_file_name ) );
		$this->assertFalse( file_exists( $result['extraction_directory'] . $invalid_file_basename ) );

		// Cleanup.
		Plugin::$instance->uploads_manager->remove_temp_file_or_dir( $result['extraction_directory'] );
	}

	public function test_handle_elementor_upload() {
		$file = [
			'tmp_name' => self::$temp_directory . self::$template_json_file_name,
		];

		// Make sure unfiltered uploads are allowed for this test.
		add_filter( 'elementor/files/allow_unfiltered_upload', function( $enabled ) {
			return true;
		} );

		$validation_result = Plugin::$instance->uploads_manager->handle_elementor_upload( $file, [ 'json' ] );
		$result = is_wp_error( $validation_result );

		$this->assertTrue( $result );
	}

	public function test_handle_elementor_upload_base64() {
		$file = [
			'fileName' => self::$base64_file_name,
			'fileData' => 'ew0KICAiY29udGVudCI6IFsNCiAgICB7DQogICAgICAiaWQiOiAiMjA0MTU4YzEiLA0KICAgICAgInNldHRpbmdzIjogew0KICAgICAgICAic2VjdGlvbl9sYXlvdXQiOiAiIiwNCiAgICAgICAgIl90aXRsZSI6ICJoZXJvIHNlY3Rpb24iDQogICAgICB9LA0KICAgICAgImVsZW1lbnRzIjogWw0KICAgICAgICB7DQogICAgICAgICAgImlkIjogIjdhOTY2OWQ5IiwNCiAgICAgICAgICAic2V0dGluZ3MiOiB7DQogICAgICAgICAgICAic3BhY2VfYmV0d2Vlbl93aWRnZXRzIjogIjIwIg0KICAgICAgICAgIH0sDQogICAgICAgICAgImVsZW1lbnRzIjogWw0KICAgICAgICAgICAgew0KICAgICAgICAgICAgICAiaWQiOiAiM2IyYWJmYWUiLA0KICAgICAgICAgICAgICAic2V0dGluZ3MiOiB7DQogICAgICAgICAgICAgICAgInNlY3Rpb25fdGl0bGUiOiAiIiwNCiAgICAgICAgICAgICAgICAidGl0bGUiOiAid29ya2Zsb3cgb3B0aW1pemF0aW9uIG1hZGUgZWFzeSINCiAgICAgICAgICAgICAgfSwNCiAgICAgICAgICAgICAgImVsZW1lbnRzIjogW10sDQogICAgICAgICAgICAgICJpc0lubmVyIjogZmFsc2UsDQogICAgICAgICAgICAgICJ3aWRnZXRUeXBlIjogImhlYWRpbmciLA0KICAgICAgICAgICAgICAiZWxUeXBlIjogIndpZGdldCINCiAgICAgICAgICAgIH0sDQogICAgICAgICAgICB7DQogICAgICAgICAgICAgICJpZCI6ICI0NWVlZGZkNyIsDQogICAgICAgICAgICAgICJzZXR0aW5ncyI6IHsNCiAgICAgICAgICAgICAgICAic2VjdGlvbl9idXR0b24iOiAiIiwNCiAgICAgICAgICAgICAgICAidGV4dCI6ICJHZXQgU3RhcnRlZCINCiAgICAgICAgICAgICAgfSwNCiAgICAgICAgICAgICAgImVsZW1lbnRzIjogW10sDQogICAgICAgICAgICAgICJpc0lubmVyIjogZmFsc2UsDQogICAgICAgICAgICAgICJ3aWRnZXRUeXBlIjogImJ1dHRvbiIsDQogICAgICAgICAgICAgICJlbFR5cGUiOiAid2lkZ2V0Ig0KICAgICAgICAgICAgfQ0KICAgICAgICAgIF0sDQogICAgICAgICAgImlzSW5uZXIiOiAiIiwNCiAgICAgICAgICAiZWxUeXBlIjogImNvbHVtbiINCiAgICAgICAgfQ0KICAgICAgXSwNCiAgICAgICJpc0lubmVyIjogIiIsDQogICAgICAiZWxUeXBlIjogInNlY3Rpb24iDQogICAgfQ0KICBdLA0KICAicGFnZV9zZXR0aW5ncyI6IHsNCiAgICAiYmFja2dyb3VuZF9iYWNrZ3JvdW5kIjogImNsYXNzaWMiLA0KICAgICJiYWNrZ3JvdW5kX2NvbG9yIjogIiNGRkZGRkYiDQogIH0sDQogICJ2ZXJzaW9uIjogIjAuNCIsDQogICJ0aXRsZSI6ICJ0ZW1wbGF0ZSBtb2NrIiwNCiAgInR5cGUiOiAicGFnZSINCn0=',
		];

		// Make sure unfiltered uploads are allowed for this test.
		add_filter( 'elementor/files/allow_unfiltered_upload', function( $enabled ) {
			return true;
		} );

		$validation_result = Plugin::$instance->uploads_manager->handle_elementor_upload( $file, [ 'json' ] );

		$result = ! is_wp_error( $validation_result );

		$this->assertTrue( $result );

		if ( ! is_wp_error( $validation_result ) ) {
			// If validation passed, files were created. Remove the files and directories generated in this test.
			Plugin::$instance->uploads_manager->remove_temp_file_or_dir( dirname( $validation_result['tmp_name'] ) );
		}
	}

	public function test_are_unfiltered_uploads_enabled() {
		$this->act_as_admin();

		$current_option_state = get_option( Uploads_Manager::UNFILTERED_FILE_UPLOADS_KEY );

		// Test when option is true.
		update_option( Uploads_Manager::UNFILTERED_FILE_UPLOADS_KEY, 1 );

		$this->assertTrue( Uploads_Manager::are_unfiltered_uploads_enabled() );

		// Test when option is false.
		update_option( Uploads_Manager::UNFILTERED_FILE_UPLOADS_KEY, 0 );

		$this->assertFalse( Uploads_Manager::are_unfiltered_uploads_enabled() );

		// Test filter - the option at this point is false, the filter modifies it to true, test that the filter works.
		add_filter( 'elementor/files/allow_unfiltered_upload', function( $enabled ) {
			return true;
		} );

		$this->assertTrue( Uploads_Manager::are_unfiltered_uploads_enabled() );

		// Restore option state
		update_option( Uploads_Manager::UNFILTERED_FILE_UPLOADS_KEY, $current_option_state );
	}

	public function test_handle_elementor_wp_media_upload() {
		$file = [
			'tmp_name' => self::$temp_directory . self::$template_json_file_name,
		];

		// Make sure unfiltered uploads are allowed for this test.
		add_filter( 'elementor/files/allow_unfiltered_upload', function( $enabled ) {
			return true;
		} );

		// Test when true.
		$_POST['elementor_wp_media_upload'] = true;

		$validation_result = Plugin::$instance->uploads_manager->handle_elementor_wp_media_upload( $file );

		$this->assertTrue( ! isset( $validation_result['error'] ) );
	}

	public function test_create_temp_file() {
		$temp_file_path = Plugin::$instance->uploads_manager->create_temp_file( json_encode( self::$mock_template ), 'test.json' );

		$this->assertTrue( file_exists( $temp_file_path ) );

		$temp_dir = dirname( $temp_file_path );

		// Delete temp file and directory.
		unlink( $temp_file_path );
		rmdir( $temp_dir );
	}

	/**
	 * @dataProvider file_names_provider
	 */
	public function test_create_invalid_filename_temp_file( $file_name ) {
		// Arrange.
		$temp_dir = Plugin::$instance->uploads_manager->get_temp_dir();
		$assert_path = '#' . preg_quote( $temp_dir, '#' ) . '[a-z0-9]+/testfile.php#';
		$template = json_encode( self::$mock_template );

		// Act.
		$temp_file_path = Plugin::$instance->uploads_manager->create_temp_file( $template, $file_name );

		// Assert.
		$this->assertRegExp( $assert_path, $temp_file_path, "Failed for file name: { $file_name }" );

		// Clean up.
		$temp_dir = dirname( $temp_file_path );

		unlink( $temp_file_path );
		rmdir( $temp_dir );
	}

	public function file_names_provider() {
		return [
			[ '../../../test/file.php' ],
			[ '..\..\..\test\file.php' ],
			[ 'test<file.php' ],
			[ 'test>file.php' ],
			[ 'test;file.php' ],
			[ 'test/file.php' ],
			[ 'test\\file.php' ],
			[ 'test%file.php' ],
		];
	}

	public function test_get_temp_dir() {
		$wp_upload_dir = wp_upload_dir();

		$slash = DIRECTORY_SEPARATOR;
		$actual_temp_dir = Plugin::$instance->uploads_manager->get_temp_dir();
		$expected_temp_dir = $wp_upload_dir['basedir'] . $slash . 'elementor' . $slash . 'tmp' . $slash;

		$this->assertEquals( $expected_temp_dir, $actual_temp_dir );
	}

	public function test_create_unique_dir() {
		$unique_dir = Plugin::$instance->uploads_manager->create_unique_dir();

		$this->assertTrue( is_dir( $unique_dir ) );

		// Delete temp directory.
		rmdir( $unique_dir );
	}

	public function test_support_unfiltered_elementor_file_uploads() {
		// support_unfiltered_elementor_file_uploads only runs if the upload is an Elementor Media upload.
		// This check is determined by the 'uploadTypeCaller' POST property.
		$_REQUEST['uploadTypeCaller'] = 'elementor-media-upload';

		// Make sure unfiltered uploads are allowed for this test.
		add_filter( 'elementor/files/allow_unfiltered_upload', function( $enabled ) {
			return true;
		} );

		$mime_types = wp_get_mime_types();

		$mime_types = Plugin::$instance->uploads_manager->support_unfiltered_elementor_file_uploads( $mime_types );

		$this->assert_array_have_keys( self::$file_types, $mime_types );
	}

	public function test_check_filetype_and_ext() {
		$file = [
			'tmp_name' => self::$temp_directory . self::$template_json_file_name,
		];

		$mimes = apply_filters( 'upload_mimes', wp_get_mime_types() );

		$mimes['json'] = 'application/json';

		$data = Plugin::$instance->uploads_manager->check_filetype_and_ext( $file, $file['tmp_name'], self::$template_json_file_name, $mimes );

		$this->assert_array_have_keys( [ 'ext', 'type' ], $data );

		$this->assertEquals( 'application/json', $data['type'] );
	}

	public function test_remove_file_or_dir() {
		// Create temp directory.
		$temp_dir = self::$temp_directory . 'temp/';
		wp_mkdir_p( $temp_dir );

		// Make sure directory was created.
		$this->assertTrue( is_dir( $temp_dir ) );

		// Create temp file.
		$temp_file = $temp_dir . self::$template_json_file_name;
		file_put_contents( $temp_file, json_encode( self::$mock_template ) );

		// Make sure file was created.
		$this->assertTrue( file_exists( $temp_file ) );

		Plugin::$instance->uploads_manager->remove_file_or_dir( $temp_file );

		// Check that file was deleted.
		$this->assertFalse( file_exists( $temp_file ) );

		Plugin::$instance->uploads_manager->remove_file_or_dir( $temp_dir );

		// Check that directory was deleted
		$this->assertFalse( is_dir( $temp_dir ) );
	}

	public function test_remove_temp_file_or_dir() {
		// Create directory and file manually.
		$temp_dir = self::$temp_directory . 'temp/';
		wp_mkdir_p( $temp_dir );
		$temp_file = $temp_dir . self::$template_json_file_name;
		file_put_contents( $temp_file, json_encode( self::$mock_template ) );

		// Make sure file was created.
		$this->assertTrue( file_exists( $temp_file ) );

		// Try removing the file.
		Plugin::$instance->uploads_manager->remove_temp_file_or_dir( $temp_file );

		// Try removing the WP content directory.
		Plugin::$instance->uploads_manager->remove_temp_file_or_dir( WP_CONTENT_DIR );

		// Check that the file and directory were NOT deleted.
		$this->assertTrue( file_exists( $temp_file ) );
		$this->assertTrue( is_dir( WP_CONTENT_DIR ) );

		// Create a temp file using Uploads Manager.
		$temp_file = Plugin::$instance->uploads_manager->create_temp_file( json_encode( self::$mock_template ), 'test.json' );

		// Make sure file was created.
		$this->assertTrue( file_exists( $temp_file ) );

		// Try removing the file.
		Plugin::$instance->uploads_manager->remove_temp_file_or_dir( $temp_file );

		// Check that the file WAS deleted.
		$this->assertFalse( file_exists( $temp_file ) );
	}
}
