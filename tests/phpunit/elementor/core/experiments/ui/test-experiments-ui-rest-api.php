<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Experiments\Ui;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Experiments\Ui\Experiments_Ui;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Experiments_Ui_Rest_Api extends Elementor_Test_Base {

	private const TOGGLE_ROUTE = '/elementor/v1/experiments-ui/toggle';

	private const BULK_ROUTE = '/elementor/v1/experiments-ui/bulk';

	private string $original_test_feature_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_test_feature_state = Plugin::$instance->experiments
			->get_features( 'test_feature' )['default'];

		Plugin::$instance->experiments->add_feature( [
			'name' => 'test_feature',
			'title' => 'Test Feature',
			'default' => Experiments_Manager::STATE_INACTIVE,
			'mutable' => true,
		] );

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();

		( new Experiments_Ui() )->register();
		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			'test_feature',
			$this->original_test_feature_state
		);

		global $wp_rest_server;
		$wp_rest_server = null;

		parent::tearDown();
	}

	public function test_toggle__forbidden_for_subscriber() {
		$this->act_as_subscriber();

		$request = new WP_REST_Request( 'POST', self::TOGGLE_ROUTE );
		$request->set_param( 'name', 'test_feature' );
		$request->set_param( 'state', 'active' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 403, $response->get_status() );
	}

	public function test_toggle__rejects_immutable_feature() {
		$this->act_as_admin();

		Plugin::$instance->experiments->add_feature( [
			'name' => 'immutable_feature',
			'title' => 'Immutable Feature',
			'default' => Experiments_Manager::STATE_ACTIVE,
			'mutable' => false,
		] );

		$request = new WP_REST_Request( 'POST', self::TOGGLE_ROUTE );
		$request->set_param( 'name', 'immutable_feature' );
		$request->set_param( 'state', 'inactive' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'experiment_not_allowed', $response->get_data()['code'] );
	}

	public function test_toggle__activates_manageable_feature() {
		$this->act_as_admin();

		$request = new WP_REST_Request( 'POST', self::TOGGLE_ROUTE );
		$request->set_param( 'name', 'test_feature' );
		$request->set_param( 'state', 'active' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertSame( 'test_feature', $data['name'] );
		$this->assertSame( 'active', $data['state'] );
		$this->assertSame( 'active', $data['actualState'] );
	}

	public function test_bulk__returns_partial_errors_for_unknown_features() {
		$this->act_as_admin();

		$request = new WP_REST_Request( 'POST', self::BULK_ROUTE );
		$request->set_param( 'names', [ 'test_feature', 'missing_feature' ] );
		$request->set_param( 'state', 'active' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertCount( 1, $data['updated'] );
		$this->assertSame( 'test_feature', $data['updated'][0]['name'] );
		$this->assertCount( 1, $data['errors'] );
		$this->assertSame( 'missing_feature', $data['errors'][0]['name'] );
		$this->assertSame( 'experiment_not_found', $data['errors'][0]['code'] );
	}
}
