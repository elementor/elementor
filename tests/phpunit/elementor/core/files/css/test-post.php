<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Post extends Elementor_Test_Base {

	const STYLED_DOCUMENT_DATA = [
		[
			'id' => 'styled-section',
			'elType' => 'section',
			'settings' => [],
			'elements' => [
				[
					'id' => 'styled-column',
					'elType' => 'column',
					'settings' => [ '_column_size' => 100 ],
					'elements' => [
						[
							'id' => 'styled-heading',
							'elType' => 'widget',
							'widgetType' => 'heading',
							'settings' => [
								'title' => 'Styled heading',
								'title_color' => '#FF0000',
							],
							'elements' => [],
						],
					],
				],
			],
		],
	];

	private $post_id_with_concurrent_write;

	public function tearDown(): void {
		remove_filter( 'update_post_metadata', [ $this, 'store_identical_meta_as_concurrent_request' ], 1 );

		parent::tearDown();
	}

	public function test_update_meta__refreshes_meta_cache_when_identical_value_is_already_stored() {
		// Arrange
		$post_id = $this->factory()->post->create();
		$meta = [
			'time' => time(),
			'status' => Post_CSS::CSS_STATUS_FILE,
		];

		get_post_meta( $post_id );

		$this->insert_meta_row_bypassing_cache( $post_id, $meta );

		$post_css = new Post_CSS( $post_id );
		$update_meta = new \ReflectionMethod( $post_css, 'update_meta' );
		$update_meta->setAccessible( true );

		// Act
		$update_meta->invoke( $post_css, $meta );

		// Assert
		$this->assertSame( $meta, get_post_meta( $post_id, Post_CSS::META_KEY, true ) );
	}

	public function test_enqueue__enqueues_css_file_when_concurrent_request_stored_identical_meta() {
		// Arrange
		$document = $this->factory()->documents->publish_and_get( [
			'meta_input' => [
				'_elementor_data' => wp_json_encode( self::STYLED_DOCUMENT_DATA ),
			],
		] );
		$post_id = $document->get_main_id();

		delete_post_meta( $post_id, Post_CSS::META_KEY );

		$this->post_id_with_concurrent_write = $post_id;
		add_filter( 'update_post_metadata', [ $this, 'store_identical_meta_as_concurrent_request' ], 1, 4 );

		// Act
		Post_CSS::create( $post_id )->enqueue();

		// Assert
		$this->assertTrue( wp_style_is( 'elementor-post-' . $post_id, 'enqueued' ) );
	}

	public function store_identical_meta_as_concurrent_request( $check, $object_id, $meta_key, $meta_value ) {
		if ( Post_CSS::META_KEY === $meta_key && $this->post_id_with_concurrent_write === $object_id ) {
			$this->insert_meta_row_bypassing_cache( $object_id, $meta_value );
		}

		return $check;
	}

	private function insert_meta_row_bypassing_cache( $post_id, $meta ) {
		global $wpdb;

		$wpdb->insert( $wpdb->postmeta, [
			'post_id' => $post_id,
			'meta_key' => Post_CSS::META_KEY,
			'meta_value' => maybe_serialize( $meta ),
		] );
	}
}
