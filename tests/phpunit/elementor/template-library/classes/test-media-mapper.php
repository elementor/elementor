<?php
namespace Elementor\Tests\Phpunit\Elementor\TemplateLibrary\Classes;

use Elementor\TemplateLibrary\Classes\Media_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Media_Mapper extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
		delete_transient( Media_Mapper::TRANSIENT_KEY );
	}

	public function tearDown(): void {
		delete_transient( Media_Mapper::TRANSIENT_KEY );
		parent::tearDown();
	}

	public function test_set_mapping_stores_transient() {
		// Arrange
		$mapping = [
			'https://example.com/image1.jpg' => 'image1.jpg',
			'https://example.com/image2.png' => 'image2.png',
		];
		$media_dir = '/tmp/test-media-dir';

		// Act
		Media_Mapper::set_mapping( $mapping, $media_dir );

		// Assert - Check that transient was created
		$stored_data = get_transient( Media_Mapper::TRANSIENT_KEY );
		$this->assertIsArray( $stored_data );
		$this->assertArrayHasKey( 'mapping', $stored_data );
		$this->assertArrayHasKey( 'media_dir', $stored_data );
		$this->assertEquals( $mapping, $stored_data['mapping'] );
		$this->assertEquals( $media_dir, $stored_data['media_dir'] );
	}

	public function test_set_mapping_empty_mapping_no_transient() {
		// Arrange
		$empty_mapping = [];
		$media_dir = '/tmp/test-media-dir';

		// Act
		Media_Mapper::set_mapping( $empty_mapping, $media_dir );

		// Assert - No transient should be created
		$stored_data = get_transient( Media_Mapper::TRANSIENT_KEY );
		$this->assertFalse( $stored_data );
	}

	public function test_get_local_file_path_no_mapping() {
		// Arrange
		$original_url = 'https://example.com/image.jpg';

		// Act
		$result = Media_Mapper::get_local_file_path( $original_url );

		// Assert
		$this->assertEquals( $original_url, $result );
	}

	public function test_get_local_file_path_loads_from_transient() {
		// Arrange
		$original_url = 'https://example.com/image.jpg';
		$local_filename = 'image.jpg';
		$media_dir = sys_get_temp_dir() . '/test-media';
		
		if ( ! file_exists( $media_dir ) ) {
			mkdir( $media_dir, 0777, true );
		}
		$local_file_path = $media_dir . '/' . $local_filename;
		file_put_contents( $local_file_path, 'test content' );

		set_transient( Media_Mapper::TRANSIENT_KEY, [
			'mapping' => [ $original_url => $local_filename ],
			'media_dir' => $media_dir,
		], HOUR_IN_SECONDS );

		// Act
		$result = Media_Mapper::get_local_file_path( $original_url );

		// Assert
		$this->assertEquals( $local_file_path, $result );

		if ( file_exists( $local_file_path ) ) {
			unlink( $local_file_path );
		}
		if ( is_dir( $media_dir ) ) {
			rmdir( $media_dir );
		}
	}

	public function test_get_local_file_path_missing_local_file() {
		// Arrange
		$original_url = 'https://example.com/missing.jpg';
		$local_filename = 'missing.jpg';
		$media_dir = '/tmp/nonexistent-dir';

		// Set up the transient with a file that doesn't exist
		set_transient( Media_Mapper::TRANSIENT_KEY, [
			'mapping' => [ $original_url => $local_filename ],
			'media_dir' => $media_dir,
		], HOUR_IN_SECONDS );

		// Act
		$result = Media_Mapper::get_local_file_path( $original_url );

		// Assert - Should return original URL since local file doesn't exist
		$this->assertEquals( $original_url, $result );
	}

	public function test_clear_mapping_removes_transient() {
		// Arrange
		$mapping = [ 'https://example.com/test.jpg' => 'test.jpg' ];
		set_transient( Media_Mapper::TRANSIENT_KEY, [
			'mapping' => $mapping,
			'media_dir' => '/tmp/test',
		], HOUR_IN_SECONDS );

		$this->assertNotFalse( get_transient( Media_Mapper::TRANSIENT_KEY ) );

		// Act
		Media_Mapper::clear_mapping();

		// Assert
		$this->assertFalse( get_transient( Media_Mapper::TRANSIENT_KEY ) );
	}
}
