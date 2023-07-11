<?php

namespace Elementor\Testing\Modules\SiteNavigation\Data\Recent;

use Elementor\Core\Base\Document;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\LandingPages\Documents\Landing_Page;
use Elementor\TemplateLibrary\Source_Local;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Controller extends Elementor_Test_Base {

	const ENDPOINT = '/site-navigation/recent-posts';

	public function setUp() {
		parent::setUp();
	}

	/**
	 * Test access denied
	 */
	public function test_get_items__forbidden() {
		// Arrange.
		$this->act_as_subscriber();

		// Act.
		$response = $this->send_request( 'GET', self::ENDPOINT, [
			'posts_per_page' => 10,
		] );

		// Assert.
		$this->assertEquals( 403, $response->get_status() );
	}

	/**
	 * @dataProvider get_items_provider
	 *
	 * @return void
	 */
	public function test_get_items__invalid_args( $posts_per_page, $post_type, $post__not_in ) {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$params = [
			'posts_per_page' => $posts_per_page,
			'post_type' => $post_type,
			'post__not_in' => $post__not_in,
		];

		$response = $this->send_request( 'GET', self::ENDPOINT, $params );

		// Assert.
		$this->assertEquals( 400, $response->get_status() );
	}

	public function get_items_provider() {
		return [
			'no params' => [
				'', '', '',
			],
			'invalid posts_per_page' => [
				'invalid', '', '',
			],
		];
	}

	public function test_get_items() {
		// Arrange.
		$this->act_as_editor();

		$older_time = time() - 20;

		// Mock ten posts.
		$posts = [];
		for ( $i = 0; $i < 10; $i ++ ) {
			$posts[] = $this->factory()->post->create_and_get( [
				'post_date' => date( 'Y-m-d H:i:s', $older_time + $i ),
				'meta_input' => [
					Document::TYPE_META_KEY => Document::get_type(),
					'_elementor_edit_mode' => 'builder',
				],
			] );
		}

		// Mock kit post - should be excluded.
		$posts[] = $this->factory()->post->create_and_get( [
			'post_title' => 'Some Kit',
			'post_type' => Source_Local::CPT,
			'meta_input' => [
				Document::TYPE_META_KEY => Kit::get_type(),
				'_elementor_edit_mode' => 'builder',
			],
		] );

		// Mock another post with info.
		$posts[] = $this->factory()->post->create_and_get( [
			'post_title' => 'Another Post',
			'post_type' => Source_Local::CPT,
			'meta_input' => [
				Document::TYPE_META_KEY => Landing_Page::get_type(),
				'_elementor_edit_mode' => 'builder',
			],
		] );

		// Act.
		$params = [
			'posts_per_page' => '3',
			'post_type' => [ Source_Local::CPT, 'post', 'page' ],
		];

		$response = $this->send_request( 'GET', self::ENDPOINT, $params );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$expected = [
			$posts[8]->ID,
			$posts[9]->ID,
			$posts[11]->ID,
		];

		$this->assertSameSets(
			$expected,
			wp_list_pluck( $response->get_data(), 'id' ),
			'Expected to get the 3 most recent posts, excluding the kit post'
		);

		$this->assertEquals( 'Another Post', $response->get_data()[0]['title'] );
		$this->assertSameSetsWithIndex( [
			'post_type' => Source_Local::CPT,
			'doc_type' => Landing_Page::get_type(),
			'label' => 'Landing Page',
		], $response->get_data()[0]['type'] );
	}

	public function test_get_items__with_exclude() {
		// Arrange.
		$this->act_as_editor();

		$posts = [];
		for ( $i = 0; $i < 5; $i ++ ) {
			$posts[] = $this->factory()->post->create_and_get( [
				'meta_input' => [
					Document::TYPE_META_KEY => Document::get_type(),
					'_elementor_edit_mode' => 'builder',
				],
			] );
		}

		// Mock kit post - should be excluded.
		$posts[] = $this->factory()->post->create_and_get( [
			'post_title' => 'Some Kit',
			'post_type' => Source_Local::CPT,
			'meta_input' => [
				Document::TYPE_META_KEY => Kit::get_type(),
				'_elementor_edit_mode' => 'builder',
			],
		] );

		// Act.
		$params = [
			'posts_per_page' => '3',
			'post_type' => [ 'elementor_library', 'post', 'page' ],
			'post__not_in' => [ $posts[1]->ID, $posts[3]->ID ],
		];

		$response = $this->send_request( 'GET', self::ENDPOINT, $params );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$expected = [
			$posts[0]->ID,
			$posts[2]->ID,
			$posts[4]->ID,
		];

		$this->assertSameSets(
			$expected,
			wp_list_pluck( $response->get_data(), 'id' ),
			'Expected to get posts excluding the specified posts'
		);
	}

	/**
	 * @param string $method
	 * @param string $endpoint
	 * @param array $params
	 *
	 * @return \WP_REST_Response
	 */
	private function send_request( string $method, string $endpoint, array $params = [] ): \WP_REST_Response {
		$request = new \WP_REST_Request( $method, "/elementor/v1{$endpoint}" );

		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}

		return rest_do_request( $request );
	}

}
