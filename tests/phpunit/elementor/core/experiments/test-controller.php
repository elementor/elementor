<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Experiments;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

class Test_Experiments_Controller extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Core\Experiments\Manager
	 */
	private $experiments;

	public function setUp() {
		parent::setUp();
		global $wp_rest_server;
		$this->server = $wp_rest_server = new \WP_REST_Server;
		do_action( 'rest_api_init' );

		$this->experiments = Plugin::instance()->experiments;
	}

	public function tearDown() {
		parent::tearDown();
		global $wp_rest_server;
		$wp_rest_server = null;
	}

	public function test_get_experiments__forbidden() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$response = $this->get_experiments();

		// Assert.
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_get_experiments() {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		$featureThatShouldBeInResponse = 'featureThatShouldBeInResponse';
		$inactiveFeatureThatShouldBeInResponse = 'inactiveFeatureThatShouldBeInResponse';
		$immutableFeatureThatShouldNotBeInResponse = 'immutableFeatureThatShouldNotBeInResponse';
		$hiddenFeatureThatShouldNotBeInResponse = 'hiddenFeatureThatShouldNotBeInResponse';
		$immutableHiddenFeatureThatShouldNotBeInResponse = 'immutableHiddenFeatureThatShouldNotBeInResponse';
		$this->add_test_feature( $featureThatShouldBeInResponse, $featureThatShouldBeInResponse . 'Title', Experiments_Manager::STATE_ACTIVE, true, false);
		$this->add_test_feature( $inactiveFeatureThatShouldBeInResponse, $inactiveFeatureThatShouldBeInResponse . 'Title', Experiments_Manager::STATE_INACTIVE, true, false);
		$this->add_test_feature( $immutableFeatureThatShouldNotBeInResponse, $immutableFeatureThatShouldNotBeInResponse . 'Title', Experiments_Manager::STATE_ACTIVE, false, false);
		$this->add_test_feature( $hiddenFeatureThatShouldNotBeInResponse, $hiddenFeatureThatShouldNotBeInResponse . 'Title', Experiments_Manager::STATE_ACTIVE, true, true);
		$this->add_test_feature( $immutableHiddenFeatureThatShouldNotBeInResponse, $immutableHiddenFeatureThatShouldNotBeInResponse . 'Title', Experiments_Manager::STATE_ACTIVE, false, true);

		// Act.
		$response = $this->get_experiments();

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data();

		$this->assertTrue( array_key_exists( $featureThatShouldBeInResponse, $data ) );
		$this->assertEquals( $featureThatShouldBeInResponse . 'Title', $data[$featureThatShouldBeInResponse]['title'] );
		$this->assertEquals( Experiments_Manager::STATE_ACTIVE, $data[$featureThatShouldBeInResponse]['status'] );
		$this->assertTrue( array_key_exists( $inactiveFeatureThatShouldBeInResponse, $data ) );
		$this->assertEquals( $inactiveFeatureThatShouldBeInResponse . 'Title', $data[$inactiveFeatureThatShouldBeInResponse]['title'] );
		$this->assertEquals( Experiments_Manager::STATE_INACTIVE, $data[$inactiveFeatureThatShouldBeInResponse]['status'] );
		$this->assertFalse( array_key_exists( $immutableFeatureThatShouldNotBeInResponse, $data ) );
		$this->assertFalse( array_key_exists( $hiddenFeatureThatShouldNotBeInResponse, $data ) );
		$this->assertFalse( array_key_exists( $immutableHiddenFeatureThatShouldNotBeInResponse, $data ) );
	}

	public function test_update_experiments__forbidden() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$response = $this->update_experiment( 'some_experiment_id', Experiments_Manager::STATE_ACTIVE );

		// Assert.
		$this->assertEquals( 403, $response->get_status() );
	}

	/**
	 * test arguments
	 */
	public function test_update_experiments__invalid_args() {
		// Arrange.
		$this->act_as_admin_or_network_admin();

		// Act.
		$no_params_request = new \WP_REST_Request( 'POST', "/elementor/v1/experiments" );
		$no_params_response = rest_do_request( $no_params_request );
		$no_experimentId_request = new \WP_REST_Request( 'POST', "/elementor/v1/experiments" );
		$no_experimentId_request->set_param( 'status', Experiments_Manager::STATE_ACTIVE );
		$no_experimentId_response = rest_do_request( $no_experimentId_request );
		$bad_status_request = $this->update_experiment( 'some_experiment_id', 'bad_status' );
		$bad_status_response = rest_do_request( $bad_status_request );

		// Assert.
		$this->assertEquals( 400, $no_params_response->get_status() );
		$this->assertEquals( 400, $no_experimentId_response->get_status() );
		$this->assertEquals( 404, $bad_status_response->get_status() );
	}

	public function test_update_experiments() {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		$experimentId = 'some_experiment_id';
		$this->add_test_feature( $experimentId, $experimentId . 'Title', Experiments_Manager::STATE_ACTIVE, true, false);

		// Set experiment as "Active" when its already "Active"
		$response = $this->update_experiment( $experimentId, Experiments_Manager::STATE_ACTIVE );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertTrue( $this->experiments->is_feature_active( $experimentId ) );
		// Set experiment as "Inactive" when its "Active"
		$response = $this->update_experiment( $experimentId, Experiments_Manager::STATE_INACTIVE );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertFalse( $this->experiments->is_feature_active( $experimentId ) );
		// Set experiment as "Inactive" when its already "Inactive"
		$response = $this->update_experiment( $experimentId, Experiments_Manager::STATE_INACTIVE );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertFalse( $this->experiments->is_feature_active( $experimentId ) );
		// Set experiment as "Active" when its "Inactive"
		$response = $this->update_experiment( $experimentId, Experiments_Manager::STATE_ACTIVE );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertTrue( $this->experiments->is_feature_active( $experimentId ) );
	}

	private function add_test_feature( $experimentId, $title, $status, $mutable, $hidden ) {
		$test_feature_data = [
			'name' => $experimentId,
			'title' => $title,
			'mutable' => $mutable,
			'hidden' => $hidden,
		];
		$this->experiments->add_feature( $test_feature_data );

		$option_key = $this->experiments->get_feature_option_key( $experimentId );
		update_option( $option_key, $status );
	}

	/**
	 * @return \WP_REST_Response
	 */
	private function get_experiments(): \WP_REST_Response {
		$request = new \WP_REST_Request( 'GET', "/elementor/v1/experiments" );

		// $response = null;
		// try {
		// 	$response = rest_do_request( $request );
		// } catch ( WPAjaxDieStopException $e ) {}
		// return null;
		// return $response;
		return $this->server->dispatch( $request );
		
	}

	/**
	 * @param string $method
	 * @param string $endpoint
	 * @param array $params
	 *
	 * @return \WP_REST_Response
	 */
	private function update_experiment( $experimentId, $status ): \WP_REST_Response {
		$request = new \WP_REST_Request( 'POST', "/elementor/v1/experiments" );
		$request->set_param( 'experimentId', $experimentId );
		$request->set_param( 'status', $status );

		return rest_do_request( $request );
	}
}
