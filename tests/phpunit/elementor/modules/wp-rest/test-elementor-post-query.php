<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\WpRest\Classes\Elementor_Post_Query;
use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Mocks\Wordpress_Mock;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Elementor_Post_Query extends Elementor_Test_Base {
	const URL = '/elementor/v1/post';

	private ?Wordpress_Mock $wordpress_mock;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->wordpress_mock = new Wordpress_Mock();

		add_action( 'rest_api_init', function () {
			( new Elementor_Post_Query() )->register( true );
		} );
		do_action( 'rest_api_init' );

	}

	public function tearDown(): void {
		$this->wordpress_mock->clean();
		$this->wordpress_mock = null;

		add_action( 'rest_api_init', function () {
			( new Elementor_Post_Query() )->register( true );
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
		$request->set_param( Elementor_Post_Query::EXCLUDED_POST_TYPE_KEYS, $params[ Elementor_Post_Query::EXCLUDED_POST_TYPE_KEYS ] );
		$request->set_param( Elementor_Post_Query::SEARCH_TERM_KEY, $params[ Elementor_Post_Query::SEARCH_TERM_KEY ] );
		$request->set_param( Elementor_Post_Query::POST_KEYS_CONVERSION_MAP, $params[ Elementor_Post_Query::POST_KEYS_CONVERSION_MAP ] );
		$request->set_header( Elementor_Post_Query::NONCE_KEY, wp_create_nonce( 'wp_rest' ) );

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
					Elementor_Post_Query::EXCLUDED_POST_TYPE_KEYS => wp_json_encode( [ 'page' ] ),
					Elementor_Post_Query::SEARCH_TERM_KEY => 'Us',
					Elementor_Post_Query::POST_KEYS_CONVERSION_MAP => wp_json_encode( [
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
					Elementor_Post_Query::EXCLUDED_POST_TYPE_KEYS => wp_json_encode( [] ),
					Elementor_Post_Query::SEARCH_TERM_KEY => '10',
					Elementor_Post_Query::POST_KEYS_CONVERSION_MAP => wp_json_encode( [
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
					Elementor_Post_Query::EXCLUDED_POST_TYPE_KEYS => wp_json_encode( [ 'product', 'post' ] ),
					Elementor_Post_Query::SEARCH_TERM_KEY => 'a ',
					Elementor_Post_Query::POST_KEYS_CONVERSION_MAP => wp_json_encode( [
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
