<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Experiments\Ui;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Experiments_Ui_Rest_Api extends Elementor_Test_Base {

	private const TOGGLE_ROUTE = '/elementor/v1/experiments-ui/toggle';

	private const BULK_ROUTE = '/elementor/v1/experiments-ui/bulk';

	private const TEST_FEATURE_NAME = 'e_experiments_ui';

	private string $original_test_feature_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_test_feature_state = Plugin::$instance->experiments
			->get_features( self::TEST_FEATURE_NAME )['state'];

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		update_option(
			Plugin::$instance->experiments->get_feature_option_key( self::TEST_FEATURE_NAME ),
			$this->original_test_feature_state
		);
		Plugin::$instance->experiments->sync_feature_state_from_saved_option( self::TEST_FEATURE_NAME );

		global $wp_rest_server;
		$wp_rest_server = null;

		parent::tearDown();
	}

	public function test_toggle__forbidden_for_subscriber() {
		$this->act_as_subscriber();

		$request = new WP_REST_Request( 'POST', self::TOGGLE_ROUTE );
		$request->set_param( 'name', self::TEST_FEATURE_NAME );
		$request->set_param( 'state', 'active' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 403, $response->get_status() );
	}

	public function test_toggle__rejects_immutable_feature() {
		$this->act_as_admin();

		$experiments = Plugin::$instance->experiments;
		$reflection = new \ReflectionClass( $experiments );
		$features_property = $reflection->getProperty( 'features' );
		$features_property->setAccessible( true );
		$features = $features_property->getValue( $experiments );
		$features[ self::TEST_FEATURE_NAME ]['mutable'] = false;
		$features_property->setValue( $experiments, $features );

		$request = new WP_REST_Request( 'POST', self::TOGGLE_ROUTE );
		$request->set_param( 'name', self::TEST_FEATURE_NAME );
		$request->set_param( 'state', 'active' );

		$response = rest_get_server()->dispatch( $request );

		$features[ self::TEST_FEATURE_NAME ]['mutable'] = true;
		$features_property->setValue( $experiments, $features );

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'experiment_not_allowed', $response->get_data()['code'] );
	}

	public function test_toggle__activates_manageable_feature() {
		$this->act_as_admin();

		$request = new WP_REST_Request( 'POST', self::TOGGLE_ROUTE );
		$request->set_param( 'name', self::TEST_FEATURE_NAME );
		$request->set_param( 'state', 'active' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertSame( self::TEST_FEATURE_NAME, $data['name'] );
		$this->assertSame( 'active', $data['state'] );
		$this->assertSame( 'active', $data['actualState'] );
	}

	public function test_bulk__returns_partial_errors_for_unknown_features() {
		$this->act_as_admin();

		$request = new WP_REST_Request( 'POST', self::BULK_ROUTE );
		$request->set_param( 'names', [ self::TEST_FEATURE_NAME, 'missing_experiments_ui_feature' ] );
		$request->set_param( 'state', 'active' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertCount( 1, $data['updated'] );
		$this->assertSame( self::TEST_FEATURE_NAME, $data['updated'][0]['name'] );
		$this->assertCount( 1, $data['errors'] );
		$this->assertSame( 'missing_experiments_ui_feature', $data['errors'][0]['name'] );
		$this->assertSame( 'experiment_not_found', $data['errors'][0]['code'] );
	}
}
