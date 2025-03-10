<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Mocks\Post_Query_Data_Mock;
use Elementor\Modules\WpRest\Classes\Post_Query;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Post_Query extends Elementor_Test_Base {
	use Post_Query_Data_Mock;

	const URL = '/elementor/v1/post';

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
	}

	public function tearDown(): void {
		$this->clean();

		parent::tearDown();
	}

	/**
	 * @dataProvider data_provider_post_query
	 */
	public function test_post_query_results( $params, $expected ) {
		echo '1111222233334444';
		var_dump( $params );
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
	public function data_provider_post_query() {
		echo '123321123';

		return $this->get_data_testing_data();
	}
}
