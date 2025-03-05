<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Utils\Collection;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\WpRest\Classes\WP_Post;
use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Isolation\Wordpress_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Elementor_Post_Query extends Elementor_Test_Base {
	const URL = '/elementor/v1/post';

	private ?Wordpress_Adapter_Interface $wordpress_adapter;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->wordpress_adapter = new Wordpress_Adapter();

		add_action( 'rest_api_init', function () {
			( new WP_Post( $this->wordpress_adapter ) )->register( true );
		} );
		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		add_action( 'rest_api_init', function () {
			( new WP_Post() )->register( true );
		} );
		do_action( 'rest_api_init' );
		parent::tearDown();
	}

	/**
	 * @dataProvider data_provider_post_query_results
	 */
	public function test_post_query_results( $params, $expected ) {
		// Arrange
		$request = new \WP_REST_Request( 'GET', self::URL );
		$request->set_param( WP_Post::EXCLUDED_POST_TYPES_KEY, $params[ WP_Post::EXCLUDED_POST_TYPES_KEY ] );
		$request->set_param( WP_Post::TERM_KEY, $params[ WP_Post::TERM_KEY ] );
		$request->set_param( WP_Post::KEYS_FORMAT_MAP_KEY, $params[ WP_Post::KEYS_FORMAT_MAP_KEY ] );
		$request->set_header( WP_Post::NONCE_KEY, wp_create_nonce( 'wp_rest' ) );

		// Act
		$response = rest_get_server()->dispatch( $request );
		$posts = $response->get_data()['data']['value'];

		// Assert
		$this->assertEqualSets( $expected, $posts );
	}

	/**
	 * Data Providers
	 */
	public function data_provider_post_query_results() {
		return [
			[
				'params' => [
					WP_Post::EXCLUDED_POST_TYPES_KEY => wp_json_encode( [ 'page' ] ),
					WP_Post::TERM_KEY => 'Us',
					WP_Post::KEYS_FORMAT_MAP_KEY => wp_json_encode( [
						'ID' => 'id',
						'post_title' => 'label',
						'post_type' => 'groupLabel',
					] ),
				],
				'expected' => [
					[
						'id' => 1004,
						'label' => 'About Us',
						'groupLabel' => 'page',
					],
					[
						'id' => 1005,
						'label' => 'Contact Us',
						'groupLabel' => 'page',
					],
				],
			],
			[
				'params' => [
					WP_Post::EXCLUDED_POST_TYPES_KEY => wp_json_encode( [] ),
					WP_Post::TERM_KEY => '10',
					WP_Post::KEYS_FORMAT_MAP_KEY => wp_json_encode( [
						'ID' => 'id',
						'post_title' => 'label',
					] ),
				],
				'expected' => [
					[
						'label' => 'Hello World',
						'id' => '1001',
					],
					[
						'label' => 'My Blogging Journey',
						'id' => '1002',
					],
					[
						'label' => 'Breaking News: Tech Trends',
						'id' => '1003',
					],
					[
						'label' => 'About Us',
						'id' => '1004',
					],
					[
						'label' => 'Contact Us',
						'id' => '1005',
					],
					[
						'label' => 'Privacy Policy',
						'id' => '1006',
					],
					[
						'label' => 'Super Phone X',
						'id' => '1007',
					],
					[
						'label' => 'Gaming Laptop Pro',
						'id' => '1008',
					],
					[
						'label' => 'Smartwatch 2025',
						'id' => '1009',
					],
					[
						'label' => 'Epic Movie: Rise of AI',
						'id' => '1010',
					],
					[
						'label' => 'Horror Night',
						'id' => '1011',
					],
					[
						'label' => 'Comedy Gold',
						'id' => '1012',
					],
				],
			],
			[
				'params' => [
					WP_Post::EXCLUDED_POST_TYPES_KEY => wp_json_encode( [ 'product', 'post' ] ),
					WP_Post::TERM_KEY => 'a ',
					WP_Post::KEYS_FORMAT_MAP_KEY => wp_json_encode( [
						'ID' => 'id',
						'post_title' => 'label',
					] ),
				],
				'expected' => [
					[
						'label' => 'Breaking News: Tech Trends',
						'id' => '1003',
					],
					[
						'label' => 'About Us',
						'id' => '1004',
					],
					[
						'label' => 'Contact Us',
						'id' => '1005',
					],
					[
						'label' => 'Privacy Policy',
						'id' => '1006',
					],
					[
						'label' => 'Gaming Laptop Pro',
						'id' => '1008',
					],
					[
						'label' => 'Smartwatch 2025',
						'id' => '1009',
					],
					[
						'label' => 'Epic Movie: Rise of AI',
						'id' => '1010',
					],
				],
			],
		];
	}
}
