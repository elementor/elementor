<?php

namespace Elementor\Testing\Modules\WpRest;

use Elementor\Modules\WpRest\Classes\WP_Post;
use Elementor\Testing\Modules\WpRest\Isolation\Wordpress_Adapter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Elementor_Post_Query extends Elementor_Test_Base {
	const URL = '/elementor/v1/post';

	protected ?WP_Post $post_query;

	public function setUp(): void {
		parent::setUp();

		$this->post_query = new WP_Post( new Wordpress_Adapter() );
		$this->post_query->register();

		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		$this->post_query = null;

		parent::tearDown();
	}

	public function test_register() {
		// Arrange
		$params = [
			WP_Post::EXCLUDED_POST_TYPES_KEY => http_build_query( [ 'page' ] ),
			WP_Post::KEYS_FORMAT_MAP_KEY => http_build_query( [
				'ID' => 'id',
				'title' => 'label',
				'post_type' => 'groupLabel',
			] ),
		];

		$query_string = '?' . http_build_query( $params );

		// Act
		$request = new \WP_REST_Request( 'GET', self::URL . $query_string );
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data();
		$value = $data['value'];

		// Assert
		var_dump( $value );
	}
}
