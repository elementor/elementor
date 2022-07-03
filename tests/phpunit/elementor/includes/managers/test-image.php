<?php
namespace Elementor\Testing\Includes\Managers;

use Elementor\Images_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Image extends Elementor_Test_Base {

	public function create_image() {
		$attachment_id = $this->_make_attachment( [
			'file' => __DIR__ . '/../../../resources/mock-image.png',
			'url' => 'https://test.local/image.png',
		] );

		$image_meta = wp_get_attachment_metadata( $attachment_id );

		$image_meta['sizes']['test_size'] = [
			'file' => 'test-image.png',
			'width' => 300,
			'height' => 300,
			'mime-type' => 'image/png',
		];

		wp_update_attachment_metadata( $attachment_id, $image_meta );

		return $attachment_id;
	}

	public function test_get_details__adds_metadata() {
		// Arrange
		$attachment_id = $this->create_image();

		// Act
		( new Images_Manager() )->get_details( $attachment_id, 'custom_100x100', false );

		// Assert
		$new_metadata = wp_get_attachment_metadata( $attachment_id );

		$this->assertTrue( is_array( $new_metadata['sizes'] ) );

		$this->assertEquals( [
				'file' => 'test-image.png',
				'width' => '300',
				'height' => '300',
				'mime-type' => 'image/png',
		], $new_metadata['sizes']['test_size'] );

		$this->assertEquals( [
				'file' => 'elementor/thumbs/mock-image.png',
				'width' => '100',
				'height' => '100',
				'mime-type' => 'image/png',
		], $new_metadata['sizes']['elementor_custom_100x100'] );
	}

	public function test_delete_custom_images() {
		// Arrange
		remove_all_actions( 'delete_attachment' );

		$base_dir = wp_get_upload_dir()['basedir'] . '/elementor/thumbs/';

		// Create base image that doesn't suppose to be deleted.
		$base_full_path = $base_dir . 'base-test-image.png';
		static::touch( $base_full_path );

		// Create custom image that do suppose to be deleted.
		$custom_full_path = $base_dir . 'mock-image.png';
		static::touch( $custom_full_path );

		$attachment_id = $this->create_image();
		$image_meta = wp_get_attachment_metadata( $attachment_id );
		$image_meta['sizes']['elementor_custom_100x100'] = [
			'file' => '/elementor/thumbs/mock-image.png',
			'width' => 100,
			'height' => 100,
			'mime-type' => 'image/png',
		];

		wp_update_attachment_metadata( $attachment_id, $image_meta );

		// Register
		$images_manager = new Images_Manager();

		// Act
		do_action( 'delete_attachment', $attachment_id );

		// Assert.
		$this->assertTrue( file_exists( $base_full_path ) );
		$this->assertFalse( file_exists( $custom_full_path ) );

		// Cleanup
		unlink( $base_full_path );
	}
}
