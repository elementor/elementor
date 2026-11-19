<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Providers\Term_Query as Term_Query_Data_Provider;
use Elementor\Modules\WpRest\Classes\Term_Query;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Term_Query extends Elementor_Test_Base {
	use Term_Query_Data_Provider;

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

	public function test_term_query_results() {
		foreach ( $this->data_provider_term_query() as $data ) {
			$this->execute( $data['params'], $data['expected'] );
		}
	}

	public function test_best_match_survives_response_limit() {
		// Arrange
		$this->create_many_matching_terms();

		// Act
		$terms = $this->dispatch_search( 'cats' );

		// Assert
		$labels = array_column( $terms, 'label' );

		$this->assertCount( Term_Query::MAX_RESPONSE_COUNT, $terms );
		$this->assertContains( 'Zebra Cats', $labels );
	}

	public function test_exact_match_ranks_first() {
		// Arrange
		$this->create_many_matching_terms();

		// Act
		$terms = $this->dispatch_search( 'cats' );

		// Assert
		$this->assertSame( 'cats', $terms[0]['label'] );
		$this->assertSame( 'Zebra Cats', $terms[1]['label'] );
	}

	public function test_searched_term_id_ranks_first() {
		// Arrange
		$this->create_many_matching_terms();

		// Act
		$terms = $this->dispatch_search( (string) $this->terms[7]->term_id );

		// Assert
		$this->assertSame( $this->terms[7]->term_id, (int) $terms[0]['id'] );
		$this->assertSame( $this->terms[7]->name, $terms[0]['label'] );
	}

	public function test_search_without_optional_params_returns_success() {
		// Arrange
		$request = new \WP_REST_Request( 'GET', self::URL );
		$request->set_param( Term_Query::SEARCH_TERM_KEY, 'ea' );
		$request->set_header( Term_Query::NONCE_KEY, wp_create_nonce( 'wp_rest' ) );

		// Act
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data();

		// Assert
		$this->assertSame( 200, $response->get_status() );
		$this->assertTrue( $data['success'] );
		$this->assertIsArray( $data['data']['value'] );
	}

	private function dispatch_search( string $term ) {
		$request = new \WP_REST_Request( 'GET', self::URL );
		$request->set_param( Term_Query::INCLUDED_TYPE_KEY, [] );
		$request->set_param( Term_Query::EXCLUDED_TYPE_KEY, [] );
		$request->set_param( Term_Query::SEARCH_TERM_KEY, $term );
		$request->set_param( Term_Query::KEYS_CONVERSION_MAP_KEY, [
			'term_id' => 'id',
			'name' => 'label',
			'taxonomy' => 'groupLabel',
		] );
		$request->set_header( Term_Query::NONCE_KEY, wp_create_nonce( 'wp_rest' ) );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );

		return $response->get_data()['data']['value'];
	}

	private function execute( $params, $expected ) {
		// Arrange
		$request = new \WP_REST_Request( 'GET', self::URL );
		$request->set_param( Term_Query::EXCLUDED_TYPE_KEY, $params[ Term_Query::EXCLUDED_TYPE_KEY ] ?? null );
		$request->set_param( Term_Query::INCLUDED_TYPE_KEY, $params[ Term_Query::INCLUDED_TYPE_KEY ] ?? null );
		$request->set_param( Term_Query::SEARCH_TERM_KEY, $params[ Term_Query::SEARCH_TERM_KEY ] );
		$request->set_param( Term_Query::KEYS_CONVERSION_MAP_KEY, $params[ Term_Query::KEYS_CONVERSION_MAP_KEY ] );
		$request->set_header( Term_Query::NONCE_KEY, wp_create_nonce( 'wp_rest' ) );

		if ( isset( $params[ Term_Query::ITEMS_COUNT_KEY ] ) ) {
			$request->set_param( Term_Query::ITEMS_COUNT_KEY, $params[ Term_Query::ITEMS_COUNT_KEY ] );
		}

		// Act
		$response = rest_get_server()->dispatch( $request );
		$terms = $response->get_data()['data']['value'];

		// Assert
		$this->assertEqualSets( $expected, $terms );
	}
}
