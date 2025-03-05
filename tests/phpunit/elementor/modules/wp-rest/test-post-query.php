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

	private ?Post_Query_Data_Mock $data_mock;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
	}

	public function tearDown(): void {
		$this->data_mock->clean();
		$this->data_mock = null;

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
		$this->data_mock = new Post_Query_Data_Mock();

		return [
			[
				'params' => Post_Query::build_query_params( [
					Post_Query::EXCLUDED_POST_TYPE_KEYS => [ 'page' ],
					Post_Query::SEARCH_TERM_KEY => 'Us',
					Post_Query::POST_KEYS_CONVERSION_MAP => [
						'ID' => 'id',
						'post_title' => 'label',
						'post_type' => 'groupLabel',
					],
				] ),
				'expected' => [
					[
						'id' => $this->data_mock[3]->ID,
						'label' => $this->data_mock[3]->post_title,
						'groupLabel' => $this->data_mock[3]->post_type,
					],
					[
						'id' => $this->data_mock[4]->ID,
						'label' => $this->data_mock[4]->post_title,
						'groupLabel' => $this->data_mock[4]->post_type,
					],
				],
			],
			[
				'params' => Post_Query::build_query_params( [
					Post_Query::EXCLUDED_POST_TYPE_KEYS => [],
					Post_Query::SEARCH_TERM_KEY => '10',
					Post_Query::POST_KEYS_CONVERSION_MAP => [
						'ID' => 'id',
						'post_title' => 'label',
					],
				] ),
				'expected' => [
					[
						'label' => $this->data_mock[0]->post_title,
						'id' => $this->data_mock[0]->ID,
					],
					[
						'label' => $this->data_mock[1]->post_title,
						'id' => $this->data_mock[1]->ID,
					],
					[
						'label' => $this->data_mock[2]->post_title,
						'id' => $this->data_mock[2]->ID,
					],
					[
						'label' => $this->data_mock[3]->post_title,
						'id' => $this->data_mock[3]->ID,
					],
					[
						'label' => $this->data_mock[4]->post_title,
						'id' => $this->data_mock[4]->ID,
					],
					[
						'label' => $this->data_mock[5]->post_title,
						'id' => $this->data_mock[5]->ID,
					],
					[
						'label' => $this->data_mock[6]->post_title,
						'id' => $this->data_mock[6]->ID,
					],
					[
						'label' => $this->data_mock[7]->post_title,
						'id' => $this->data_mock[7]->ID,
					],
					[
						'label' => $this->data_mock[8]->post_title,
						'id' => $this->data_mock[8]->ID,
					],
					[
						'label' => $this->data_mock[9]->post_title,
						'id' => $this->data_mock[9]->ID,
					],
					[
						'label' => $this->data_mock[10]->post_title,
						'id' => $this->data_mock[10]->ID,
					],
					[
						'label' => $this->data_mock[11]->post_title,
						'id' => $this->data_mock[11]->ID,
					],
				],
			],
			[
				'params' => Post_Query::build_query_params( [
					Post_Query::EXCLUDED_POST_TYPE_KEYS => [ 'product', 'post' ],
					Post_Query::SEARCH_TERM_KEY => 'a ',
					Post_Query::POST_KEYS_CONVERSION_MAP => [
						'ID' => 'id',
						'post_title' => 'label',
					],
				] ),
				'expected' => [
					[
						'label' => $this->data_mock[2]->post_title,
						'id' => $this->data_mock[2]->ID,
					],
					[
						'label' => $this->data_mock[3]->post_title,
						'id' => $this->data_mock[3]->ID,
					],
					[
						'label' => $this->data_mock[4]->post_title,
						'id' => $this->data_mock[4]->ID,
					],
					[
						'label' => $this->data_mock[5]->post_title,
						'id' => $this->data_mock[5]->ID,
					],
					[
						'label' => $this->data_mock[7]->post_title,
						'id' => $this->data_mock[7]->ID,
					],
					[
						'label' => $this->data_mock[8]->post_title,
						'id' => $this->data_mock[8]->ID,
					],
					[
						'label' => $this->data_mock[9]->post_title,
						'id' => $this->data_mock[9]->ID,
					],
				],
			],
		];
	}
}
