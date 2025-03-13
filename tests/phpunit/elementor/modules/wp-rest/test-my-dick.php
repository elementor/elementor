<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use Elementor\Modules\WpRest\Classes\Post_Query;
use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Base\Post_Query_Base;
use function PHPUnit\Framework\assertEquals;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_My_Dick extends Post_Query_Base {
	const URL = '/elementor/v1/post';

	public function tearDown(): void {
		$this->clean();

		parent::tearDown();
	}

	/**
	 * @dataProvider data_provider_post_query
	 */
	public function test__post_query( $params, $expected ) {
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
}
