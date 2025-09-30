<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Providers\User_Query as User_Query_Data_Provider;
use Elementor\Modules\WpRest\Classes\User_Query;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_User_Query extends Elementor_Test_Base {
	use User_Query_Data_Provider;

	const URL = '/elementor/v1/user';

	public function setUp(): void {
		parent::setUp();

		$this->init();
		$this->act_as_admin();
	}

	public function tearDown(): void {
		$this->clean();

		parent::tearDown();
	}

	public function test_user_query_results() {
		foreach ( $this->data_provider_user_query() as $data ) {
			$this->execute( $data['params'], $data['expected'] );
		}
	}

	private function execute( $params, $expected ) {
		// Arrange
		$request = new \WP_REST_Request( 'GET', self::URL );
		$request->set_param( User_Query::SEARCH_TERM_KEY, $params[ User_Query::SEARCH_TERM_KEY ] );
		$request->set_param( User_Query::KEYS_CONVERSION_MAP_KEY, $params[ User_Query::KEYS_CONVERSION_MAP_KEY ] );
		$request->set_header( User_Query::NONCE_KEY, wp_create_nonce( 'wp_rest' ) );

		if ( isset( $params[ User_Query::ITEMS_COUNT_KEY ] ) ) {
			$request->set_param( User_Query::ITEMS_COUNT_KEY, $params[ User_Query::ITEMS_COUNT_KEY ] );
		}

		// Act
		$response = rest_get_server()->dispatch( $request );
		$users = $response->get_data()['data']['value'];

		// Assert
		$this->assertEqualSets( $expected, $users );
	}
}
