<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Remap_Component_Media;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Classes\Media_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group components-import-export
 */
class Test_Remap_Component_Media extends Elementor_Test_Base {
	const FIXTURE_IMAGE = __DIR__ . '/../../../../resources/pixel.jpg';
	const SOURCE_ATTACHMENT_ID = 3249;
	const SOURCE_IMAGE_URL = 'https://source.test/wp-content/uploads/hero.jpg';
	const EXTERNAL_IMAGE_URL = 'https://cdn.test/external.jpg';

	private $http_filter = null;

	private $collect_action = null;

	public function tearDown(): void {
		Media_Mapper::clear_mapping();

		if ( $this->http_filter ) {
			remove_filter( 'pre_http_request', $this->http_filter );
		}

		if ( $this->collect_action ) {
			remove_action( 'elementor/templates/collect_media_url', $this->collect_action );
		}

		parent::tearDown();
	}

	public function test_for_export__adds_url_to_media_library_images_and_collects_it() {
		// Arrange
		$attachment_id = self::factory()->attachment->create_upload_object( self::FIXTURE_IMAGE );
		$collected_urls = [];
		$this->collect_action = function ( $url ) use ( &$collected_urls ) {
			$collected_urls[] = $url;
		};
		add_action( 'elementor/templates/collect_media_url', $this->collect_action );
		$data = [
			'override_value' => $this->image_src( $attachment_id, null ),
			'external' => $this->image_src( null, self::EXTERNAL_IMAGE_URL ),
		];

		// Act
		$result = Remap_Component_Media::for_export( $data );

		// Assert
		$expected_url = wp_get_attachment_url( $attachment_id );
		$this->assertSame( $attachment_id, $result['override_value']['value']['id']['value'] );
		$this->assertSame( $expected_url, $result['override_value']['value']['url']['value'] );
		$this->assertSame( $data['external'], $result['external'] );
		$this->assertSame( [ $expected_url ], $collected_urls );
	}

	public function test_for_import__imports_mapped_local_file_and_keeps_only_the_new_id() {
		// Arrange
		WP_Filesystem();
		$media_dir = Plugin::$instance->uploads_manager->create_unique_dir();
		copy( self::FIXTURE_IMAGE, $media_dir . '/hero.jpg' );
		Media_Mapper::set_mapping( [ self::SOURCE_IMAGE_URL => 'hero.jpg' ], $media_dir );
		$data = [ 'nested' => [ 'image' => $this->image_src( self::SOURCE_ATTACHMENT_ID, self::SOURCE_IMAGE_URL ) ] ];

		// Act
		$result = Remap_Component_Media::for_import( $data );

		// Assert
		$imported_id = $result['nested']['image']['value']['id']['value'];
		$this->assertNotSame( self::SOURCE_ATTACHMENT_ID, $imported_id );
		$this->assertSame( 'attachment', get_post_type( $imported_id ) );
		$this->assertNull( $result['nested']['image']['value']['url'] );
	}

	public function test_for_import__falls_back_to_source_url_when_download_fails() {
		// Arrange
		$this->http_filter = fn() => new \WP_Error( 'http_request_failed', 'offline' );
		add_filter( 'pre_http_request', $this->http_filter );
		$data = [ 'image' => $this->image_src( self::SOURCE_ATTACHMENT_ID, self::SOURCE_IMAGE_URL ) ];

		// Act
		$result = Remap_Component_Media::for_import( $data );

		// Assert
		$this->assertNull( $result['image']['value']['id'] );
		$this->assertSame( self::SOURCE_IMAGE_URL, $result['image']['value']['url']['value'] );
	}

	public function test_for_import__leaves_external_images_untouched() {
		// Arrange
		$requests = 0;
		$this->http_filter = function () use ( &$requests ) {
			++$requests;

			return new \WP_Error( 'http_request_failed', 'offline' );
		};
		add_filter( 'pre_http_request', $this->http_filter );
		$data = [ 'image' => $this->image_src( null, self::EXTERNAL_IMAGE_URL ) ];

		// Act
		$result = Remap_Component_Media::for_import( $data );

		// Assert
		$this->assertSame( $data, $result );
		$this->assertSame( 0, $requests );
	}

	private function image_src( ?int $attachment_id, ?string $url ): array {
		return [
			'$$type' => 'image-src',
			'value' => [
				'id' => null === $attachment_id ? null : [
					'$$type' => 'image-attachment-id',
					'value' => $attachment_id,
				],
				'url' => null === $url ? null : [
					'$$type' => 'url',
					'value' => $url,
				],
			],
		];
	}
}
