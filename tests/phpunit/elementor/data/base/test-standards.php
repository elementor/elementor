<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base;

/*
 * The tests aim to cover the rest standards for api routing running the endpoints via `Data\Manager::run`.
 * The deepest level that should be validated in each test is '/alpha/1/beta/1/gamma/1/'.
 *
 * Try reach the standards with controllers, sub-controllers, endpoints, sub-endpoints.
 * at least show where the limits for them.
 */

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Standards\OnlyController\AlphaController as OnlyControllerAlphaController;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Standards\OnlySubController\BetaController as OnlySubControllerBetaController;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Standards\OnlyEndpoint\GammaEndpoint as OnlyEndpointGammaEndpoint;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Standards\OnlySubEndpoint\BetaSubEndpoint as OnlySubEndpointBetaSubEndpoint;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Standards\OnlySubEndpoint\GammaSubEndpoint as OnlySubEndpointGammaSubEndpoint;

class Test_Standards extends Data_Test_Base {
	public function test_only_controller() {
		// Arrange - '/alpha'.
		$controller = new OnlyControllerAlphaController();

		$this->manager->register_controller_instance( $controller );

		// Act - Reach '/alpha'
		$result = $this->manager->run( 'alpha' );

		// Assert - '/alpha'.
		$this->assertEquals( 'alpha-items', $result );

		// Arrange - '/alpha/1'.
		$controller->get_endpoint_index()->register_item_route();

		// Act - Reach '/alpha/1'
		$result = $this->manager->run( 'alpha/index', [ 'id' => '1' ] );

		// Assert - '/alpha/1'.
		$this->assertEquals( 'alpha-item', $result );

		// Note: Using only controllers it can reach only 'alpha/1'.
	}

	public function test_sub_controllers() {
		// Arrange - '/alpha'.
		$alpha_controller = new OnlyControllerAlphaController();

		$this->manager->register_controller_instance( $alpha_controller );

		$this->manager->run_server();

		// Act - Reach '/alpha'
		$result = $this->manager->run( 'alpha' );

		// Assert - '/alpha'.
		$this->assertEquals( 'alpha-items', $result );

		// Arrange - '/alpha/1'.
		$alpha_controller->get_endpoint_index()->register_item_route();

		// Act - Reach '/alpha/1'
		$result = $this->manager->run( 'alpha/index', [
			'id' => '1'
		] );

		// Assert - '/alpha/1'.
		$this->assertEquals( 'alpha-item', $result );

		// Arrange - '/alpha/{id}/beta'.
		$beta_controller = new OnlySubControllerBetaController();

		$this->manager->register_controller_instance( $beta_controller );
		$beta_controller->do_register();

		// Act - Reach '/alpha/1/beta'
		$result = $this->manager->run( 'alpha/beta/index', [
			'id' => '1'
		] );

		// Assert - '/alpha/1/beta'.
		$this->assertEquals( 'beta-items', $result );

		// Arrange - '/alpha/1/beta/1'.
		$beta_controller->get_endpoint_index()->register_item_route( \WP_REST_Server::READABLE, [
				'id_arg_name' => 'sub_id',
		] );

		// Act - Reach '/alpha/1/beta/1'
		$result = $this->manager->run( 'alpha/beta/index', [
			'id' => '1',
			'sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1'.
		$this->assertEquals( 'beta-item', $result );

		// Note: Using only controllers it can reach only '/alpha/1/beta/1'.
		// TODO: Next code works only in local PHPUnit.
		//$this->expectException( \PHPUnit\Framework\Error\Notice::class );

		//new SubController( $beta_controller );
	}

	public function test_endpoints() {
		// Since endpoints cannot exist without controllers, this test allow to use controllers.
		// Arrange - '/alpha'.
		$alpha_controller = new OnlyControllerAlphaController();

		$this->manager->register_controller_instance( $alpha_controller );

		$this->manager->run_server();

		// Act - Reach '/alpha'
		$result = $this->manager->run( 'alpha' );

		// Assert - '/alpha'.
		$this->assertEquals( 'alpha-items', $result );

		// Arrange - '/alpha/1'.
		$alpha_controller->get_endpoint_index()->register_item_route();

		// Act - Reach '/alpha/1'
		$result = $this->manager->run( 'alpha/index', [
			'id' => '1'
		] );

		// Assert - '/alpha/1'.
		$this->assertEquals( 'alpha-item', $result );

		// Note: Using only endpoints and controllers it can reach only '/alpha/1/'. since:
		// There is no way to attach on 'index endpoint' using only endpoints. sub-endpoint is the soultion.
	}

	public function test_endpoints_include_sub_controllers() {
		// Arrange - '/alpha'.
		$alpha_controller = new OnlyControllerAlphaController();

		$this->manager->register_controller_instance( $alpha_controller );

		$this->manager->run_server();

		// Act - Reach '/alpha'
		$result = $this->manager->run( 'alpha' );

		// Assert - '/alpha'.
		$this->assertEquals( 'alpha-items', $result );

		// Arrange - '/alpha/1'.
		$alpha_controller->get_endpoint_index()->register_item_route();

		// Act - Reach '/alpha/1'
		$result = $this->manager->run( 'alpha/index', [
			'id' => '1'
		] );

		// Assert - '/alpha/1'.
		$this->assertEquals( 'alpha-item', $result );

		// Arrange - '/alpha/{id}/beta'.
		$beta_controller = new OnlySubControllerBetaController();

		$this->manager->register_controller_instance( $beta_controller );
		$beta_controller->do_register();

		// Act - Reach '/alpha/1/beta'
		$result = $this->manager->run( 'alpha/beta/index', [
			'id' => '1'
		] );

		// Assert - '/alpha/1/beta'.
		$this->assertEquals( 'beta-items', $result );

		// Arrange - '/alpha/1/beta/1'.
		$beta_controller->get_endpoint_index()->register_item_route( \WP_REST_Server::READABLE, [
				'id_arg_name' => 'sub_id',
		] );

		// Act - Reach '/alpha/1/beta/1'
		$result = $this->manager->run( 'alpha/beta/index', [
			'id' => '1',
			'sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1'.
		$this->assertEquals( 'beta-item', $result );

		// Note: Using sub-controllers and endpoints it can reach only '/alpha/1/beta/1'.
		// The issue is that gamma endpoint route will be '/alpha/(?P<sub_id>[\w]+)/beta/gamma'.
		// And not '/alpha/(?P<id>[\w]+)/beta/(?P<sub_id>[\w]+)/gamma' as may assumed.

		// Arrange - '/alpha/{id}/beta/1/gamma'.
		$gamma_endpoint = $beta_controller->do_register_endpoint( new OnlyEndpointGammaEndpoint( $beta_controller ) );

		// Act - Reach '/alpha/1/beta/1/gamma'
		$result = $this->manager->run( 'alpha/beta/gamma', [
			'id' => '1',
			'sub_id' => '1',
		] );

		// Assert not equals - '/alpha/1/beta/1/gamma'.
		$this->assertNotEquals( 'gamma-items', $result );
	}

	public function test_sub_endpoints() {
		// Since sub-endpoints cannot exist without endpoints
		// And endpoints does not exist without controllers, this test allow to use controllers, and endpoints.
		// Arrange - '/alpha'.
		$alpha_controller = new OnlyControllerAlphaController();

		$this->manager->register_controller_instance( $alpha_controller );

		$this->manager->run_server();

		// Act - Reach '/alpha'
		$result = $this->manager->run( 'alpha' );

		// Assert - '/alpha'.
		$this->assertEquals( 'alpha-items', $result );

		// Arrange - '/alpha/1'.
		$alpha_index_endpoint = $alpha_controller->get_endpoint_index();
		$alpha_index_endpoint->register_item_route();

		// Act - Reach '/alpha/1'
		$result = $this->manager->run( 'alpha/index', [
			'id' => '1'
		] );

		// Assert - '/alpha/1'.
		$this->assertEquals( 'alpha-item', $result );

		// Using only endpoints and controllers it can reach only '/alpha/1/', force to try sub-endpoints.
		// Arrange - '/alpha/{id}/beta'.
		$beta_sub_endpoint = $alpha_index_endpoint->register_sub_endpoint(
			new OnlySubEndpointBetaSubEndpoint( $alpha_index_endpoint, '(?P<id>[\w]+)')
		);

		// Act - Reach '/alpha/1/beta'
		$result = $this->manager->run( 'alpha/beta', [
			'id' => '1'
		] );

		// Assert - '/alpha/1/beta'.
		$this->assertEquals( 'beta-items', $result );

		// Arrange - '/alpha/1/beta/1'.
		$beta_sub_endpoint->register_item_route( \WP_REST_Server::READABLE, [
				'id_arg_name' => 'sub_id',
		] );

		// Act - Reach '/alpha/1/beta/1'
		$result = $this->manager->run( 'alpha/beta', [
			'id' => '1',
			'sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1'.
		$this->assertEquals( 'beta-item', $result );

		// Arrange - '/alpha/{id}/beta/1/gamma'.
		$gamma_sub_endpoint = $beta_sub_endpoint->register_sub_endpoint(
			new OnlySubEndpointGammaSubEndpoint( $beta_sub_endpoint, '(?P<sub_id>[\w]+)' )
		);

		// Act - Reach '/alpha/1/beta/1/gamma'
		$result = $this->manager->run( 'alpha/beta/gamma', [
			'id' => '1',
			'sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1/gamma'.
		$this->assertEquals( 'gamma-items', $result );

		// Arrange - '/alpha/1/beta/1/gamma/1'.
		$gamma_sub_endpoint->register_item_route( \WP_REST_Server::READABLE, [
				'id_arg_name' => 'sub_sub_id',
		] );

		// Act - Reach '/alpha/1/beta/1/gamma/1'
		$result = $this->manager->run( 'alpha/beta/gamma', [
			'id' => '1',
			'sub_id' => '1',
			'sub_sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1/gamma/1'.
		$this->assertEquals( 'gamma-item', $result );
	}

	public function test_sub_endpoints_include_sub_controllers() {
		// Arrange - '/alpha'.
		$alpha_controller = new OnlyControllerAlphaController();

		$this->manager->register_controller_instance( $alpha_controller );

		$this->manager->run_server();

		// Act - Reach '/alpha'
		$result = $this->manager->run( 'alpha' );

		// Assert - '/alpha'.
		$this->assertEquals( 'alpha-items', $result );

		// Arrange - '/alpha/1'.
		$alpha_controller->get_endpoint_index()->register_item_route();

		// Act - Reach '/alpha/1'
		$result = $this->manager->run( 'alpha/index', [
			'id' => '1'
		] );

		// Assert - '/alpha/1'.
		$this->assertEquals( 'alpha-item', $result );

		// Arrange - '/alpha/{id}/beta'.
		$beta_controller = new OnlySubControllerBetaController();

		$this->manager->register_controller_instance( $beta_controller );
		$beta_controller->do_register();

		// Act - Reach '/alpha/1/beta'
		$result = $this->manager->run( 'alpha/beta/index', [
			'id' => '1'
		] );

		// Assert - '/alpha/1/beta'.
		$this->assertEquals( 'beta-items', $result );

		// Arrange - '/alpha/1/beta/1'.
		$beta_index_endpoint = $beta_controller->get_endpoint_index();
		$beta_index_endpoint->register_item_route( \WP_REST_Server::READABLE, [
				'id_arg_name' => 'sub_id',
		] );

		// Act - Reach '/alpha/1/beta/1'
		$result = $this->manager->run( 'alpha/beta/index', [
			'id' => '1',
			'sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1'.
		$this->assertEquals( 'beta-item', $result );

		// Arrange - '/alpha/{id}/beta/1/gamma'.
		$gamma_sub_endpoint = $beta_index_endpoint->register_sub_endpoint(
			new OnlySubEndpointGammaSubEndpoint( $beta_index_endpoint, '(?P<sub_sub_id>[\w]+)' )
		);

		// Act - Reach '/alpha/1/beta/1/gamma'
		$result = $this->manager->run( 'alpha/beta/gamma', [
			'id' => '1',
			'sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1/gamma'.
		$this->assertEquals( 'gamma-items', $result );

		// Arrange - '/alpha/1/beta/1/gamma/1'.
		$gamma_sub_endpoint->register_item_route( \WP_REST_Server::READABLE, [
				'id_arg_name' => 'sub_sub_id',
		] );

		// Act - Reach '/alpha/1/beta/1/gamma/1'
		$result = $this->manager->run( 'alpha/beta/gamma', [
			'id' => '1',
			'sub_id' => '1',
			'sub_sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1/gamma/1'.
		$this->assertEquals( 'gamma-item', $result );
	}
}
