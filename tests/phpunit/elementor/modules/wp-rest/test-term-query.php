<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Providers\Post_Query as Post_Query_Data_Provider;
use Elementor\Modules\WpRest\Classes\Post_Query;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Term_Query extends Elementor_Test_Base {
	use Post_Query_Data_Provider;

	const URL = '/elementor/v1/term';

	public function setUp(): void {
		parent::setUp();

		$this->init();
		$this->act_as_admin();
	}

	public function tearDown(): void {
		$this->clean();

		parent::tearDown();
	}

	public function test_post_query_results() {
		foreach ( $this->data_provider_post_query() as $data ) {
			$this->execute( $data['params'], $data['expected'] );
		}
	}

	private function execute( $params, $expected ) {
		// Arrange
		$request = new \WP_REST_Request( 'GET', self::URL );
		$request->set_param( Post_Query::EXCLUDED_TYPE_KEY, $params[ Post_Query::EXCLUDED_TYPE_KEY ] );
		$request->set_param( Post_Query::SEARCH_TERM_KEY, $params[ Post_Query::SEARCH_TERM_KEY ] );
		$request->set_param( Post_Query::KEYS_CONVERSION_MAP_KEY, $params[ Post_Query::KEYS_CONVERSION_MAP_KEY ] );
		$request->set_header( Post_Query::NONCE_KEY, wp_create_nonce( 'wp_rest' ) );

		// Act
		$response = rest_get_server()->dispatch( $request );
		$posts = $response->get_data()['data']['value'];

		// Assert
		$this->assertEqualSets( $expected, $posts );
	}
}
