<?php
namespace Elementor\Testing\Includes\Managers;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Images_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Image extends Elementor_Test_Base {
	const MISSING_ATTACHMENT_ID = 999999;
	const CUSTOM_SIZE = 'custom_100x100';
	const CUSTOM_SIZE_META_KEY = 'elementor_custom_100x100';

	private function create_image( $author_id = 0 ) {
		$file_name = __DIR__ . '/../../../resources/mock-image.png';

		$attachment_id = wp_insert_attachment( [
			'post_title' => wp_basename( $file_name ),
			'post_content' => '',
			'post_type' => 'attachment',
			'post_author' => $author_id,
			'post_parent' => 0,
			'post_mime_type' => wp_check_filetype( $file_name )['type'],
			'guid' => 'https://test.local/mock-image.png',
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

	private function call_get_images_details( array $items, $nonce ) {
		$_POST['items'] = $items;
		$_POST['_nonce'] = $nonce;
		$_REQUEST['_nonce'] = $nonce;

		$throw_die_handler = function () {
			return function () {
				throw new \WPDieException();
			};
		};

		add_filter( 'wp_doing_ajax', '__return_true' );
		add_filter( 'wp_die_ajax_handler', $throw_die_handler );

		ob_start();

		try {
			( new Images_Manager() )->get_images_details();
		} catch ( \WPDieException $e ) {
			// wp_send_json ends with wp_die, which the handler above turns into an exception.
		} finally {
			$output = ob_get_clean();

			remove_filter( 'wp_doing_ajax', '__return_true' );
			remove_filter( 'wp_die_ajax_handler', $throw_die_handler );
			unset( $_POST['items'], $_POST['_nonce'], $_REQUEST['_nonce'] );
		}

		return json_decode( $output, true );
	}

	private function custom_size_item( $attachment_id ) {
		return [
			'id' => $attachment_id,
			'size' => static::CUSTOM_SIZE,
			'is_first_time' => 'false',
		];
	}

	private function get_sizes( $attachment_id ) {
		return wp_get_attachment_metadata( $attachment_id )['sizes'];
	}

	public function test_get_images_details__author_on_admin_image_returns_url_without_metadata_write() {
		// Arrange
		$admin = $this->act_as_admin();
		$attachment_id = $this->create_image( $admin->ID );
		$this->act_as( 'author' );

		// Act
		$response = $this->call_get_images_details(
			[ $this->custom_size_item( $attachment_id ) ],
			wp_create_nonce( Ajax::NONCE_KEY )
		);

		// Assert
		$this->assertTrue( $response['success'] );
		$this->assertNotEmpty( $response['data'][ $attachment_id ][ static::CUSTOM_SIZE ] );
		$this->assertArrayNotHasKey( static::CUSTOM_SIZE_META_KEY, $this->get_sizes( $attachment_id ) );
	}

	public function test_get_images_details__author_on_own_image_persists_metadata() {
		// Arrange
		$author = $this->act_as( 'author' );
		$attachment_id = $this->create_image( $author->ID );

		// Act
		$response = $this->call_get_images_details(
			[ $this->custom_size_item( $attachment_id ) ],
			wp_create_nonce( Ajax::NONCE_KEY )
		);

		// Assert
		$this->assertTrue( $response['success'] );
		$this->assertArrayHasKey( static::CUSTOM_SIZE_META_KEY, $this->get_sizes( $attachment_id ) );
	}

	public function test_get_images_details__rejects_invalid_nonce() {
		// Arrange
		$author = $this->act_as( 'author' );
		$attachment_id = $this->create_image( $author->ID );

		// Act
		$response = $this->call_get_images_details(
			[ $this->custom_size_item( $attachment_id ) ],
			'invalid'
		);

		// Assert
		$this->assertFalse( $response['success'] );
		$this->assertArrayNotHasKey( static::CUSTOM_SIZE_META_KEY, $this->get_sizes( $attachment_id ) );
	}

	public function test_get_images_details__contributor_denied() {
		// Arrange
		$contributor = $this->act_as( 'contributor' );
		$attachment_id = $this->create_image( $contributor->ID );

		// Act
		$response = $this->call_get_images_details(
			[ $this->custom_size_item( $attachment_id ) ],
			wp_create_nonce( Ajax::NONCE_KEY )
		);

		// Assert
		$this->assertSame( [
			'success' => false,
			'data' => 'Permission denied',
		], $response );
		$this->assertArrayNotHasKey( static::CUSTOM_SIZE_META_KEY, $this->get_sizes( $attachment_id ) );
	}

	public function test_get_details__skips_metadata_when_persist_disabled() {
		// Arrange
		$attachment_id = $this->create_image();

		// Act
		$details = ( new Images_Manager() )->get_details( $attachment_id, static::CUSTOM_SIZE, 'false', false );

		// Assert
		$this->assertNotEmpty( $details[ static::CUSTOM_SIZE ] );
		$this->assertArrayNotHasKey( static::CUSTOM_SIZE_META_KEY, $this->get_sizes( $attachment_id ) );
	}

	public function test_get_details__adds_metadata() {
		// Arrange
		$attachment_id = $this->create_image();

		// Act
		( new Images_Manager() )->get_details( $attachment_id, 'custom_100x', false );
		( new Images_Manager() )->get_details( $attachment_id, 'custom_150x150', false );
		( new Images_Manager() )->get_details( $attachment_id, 'custom_x200', false );

		// Assert
		$new_metadata = wp_get_attachment_metadata( $attachment_id );

		$this->assertTrue( is_array( $new_metadata['sizes'] ) );

		$this->assertSame( [
			'file' => 'test-image.png',
			'width' => 300,
			'height' => 300,
			'mime-type' => 'image/png',
		], $new_metadata['sizes']['test_size'] );

		$this->assertSame( [
			'file' => 'elementor/thumbs/mock-image.png',
			'width' => 100,
			'height' => 0,
			'mime-type' => 'image/png',
		], $new_metadata['sizes']['elementor_custom_100x'] );

		$this->assertSame( [
			'file' => 'elementor/thumbs/mock-image.png',
			'width' => 150,
			'height' => 150,
			'mime-type' => 'image/png',
		], $new_metadata['sizes']['elementor_custom_150x150'] );

		$this->assertSame( [
			'file' => 'elementor/thumbs/mock-image.png',
			'width' => 0,
			'height' => 200,
			'mime-type' => 'image/png',
		], $new_metadata['sizes']['elementor_custom_x200'] );

	}

	public function test_get_details__returns_null_url_for_missing_attachment() {
		// Act
		$details = ( new Images_Manager() )->get_details( static::MISSING_ATTACHMENT_ID, 'full', 'false' );

		// Assert
		$this->assertSame( [ 'full' => null ], $details );
	}

	public function test_get_details__returns_null_url_for_missing_attachment_with_custom_size() {
		// Act
		$details = ( new Images_Manager() )->get_details( static::MISSING_ATTACHMENT_ID, 'custom_100x100', 'false' );

		// Assert
		$this->assertSame( [ 'custom_100x100' => null ], $details );
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
