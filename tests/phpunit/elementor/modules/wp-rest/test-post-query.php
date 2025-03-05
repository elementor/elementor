<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Mocks\Post_Query_Data_Mock;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\WpRest\Classes\Post_Query;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Post_Query extends Elementor_Test_Base {
	const URL = '/elementor/v1/post';

	private ?Post_Query_Data_Mock $wordpress_mock;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
	}

	public function tearDown(): void {
		$this->wordpress_mock->clean();
		$this->wordpress_mock = null;

		parent::tearDown();
	}

	/**
	 * @dataProvider data_provider_post_query_results
	 */
	public function test_post_query_results( $params, $expected ) {
		// Arrange
		$request = new \WP_REST_Request( 'GET', self::URL );
		$request->set_param( Post_Query::EXCLUDED_POST_TYPE_KEYS, $params[ Post_Query::EXCLUDED_POST_TYPE_KEYS ] );
		$request->set_param( Post_Query::SEARCH_TERM_KEY, $params[ Post_Query::SEARCH_TERM_KEY ] );
		$request->set_param( Post_Query::POST_KEYS_CONVERSION_MAP, $params[ Post_Query::POST_KEYS_CONVERSION_MAP ] );
		$request->set_header( Post_Query::NONCE_KEY, wp_create_nonce( 'wp_rest' ) );

		// Act
		$response = rest_get_server()->dispatch( $request );
		$posts = $response->get_data()['data']['value'];

		var_dump( 'exp', $expected );
		var_dump( 'posts', $posts );

		// Assert
		$this->assertEqualSets( $expected, $posts );
	}

	/**
	 * Data Providers
	 */
	public function data_provider_post_query_results() {
		$this->wordpress_mock = new Post_Query_Data_Mock();

		return $this->wordpress_mock->get_test_data_based_on_index();
	}
}
