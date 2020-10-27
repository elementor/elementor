<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base;

/**
 * The tests aim to cover the rest standards for api routing running the endpoints via `Data\Manager::run`.
 * The deepest level that should be validated in each test is '/alpha/1/beta/1/gamma/1/'.
 *
 * Try reach the standards with controllers, sub-controllers, endpoints, sub-endpoints.
 * at least show where the limits for them.
 *
 * @important: Currently using only 'out of box' endpoints and controllers, the route limit will be '/alpha/1/'. since:
 * There is no way to attach on 'default controller index endpoint' which is require: 'sub-endpoint'.
 * They only way possible is by manual extending Endpoint class, and override few methods,
 * check the namespace `Elementor\Data\Base\Endpoint\Index` for more information.
 *
 * Also, using controllers, sub-controllers and endpoints the limit will be '/alpha/1/beta/1'.
 * The issue is that gamma endpoint route, will be '/alpha/(?P<sub_id>[\w]+)/beta/gamma'.
 * And not '/alpha/(?P<id>[\w]+)/beta/(?P<sub_id>[\w]+)/gamma' as may assumed.
 *
 * currently 'out of box' solution for reaching '/alpha/1/beta/1/gamma/1/', is classes: described in the tests below.
 */

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Standards;

class Test_Standards extends Data_Test_Base {
	public function test_only_controller() {
		// Arrange - '/alpha'.
		$controller = new Standards\OnlyController\AlphaController();

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
		// Arrange - '/alpha/{id}/beta'.
		$alpha_controller = new Standards\OnlyController\AlphaController();
		$this->manager->register_controller_instance( $alpha_controller );
		$this->manager->run_server();

		$beta_controller = new Standards\OnlySubController\BetaController();
		$this->manager->register_controller_instance( $beta_controller );
		$beta_controller->do_register();

		// Act - Reach '/alpha/1/beta'
		$result = $this->manager->run( 'alpha/beta/index', [
			'id' => '1',
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

		/**
		 * @note Using only controllers & sub-controllers it can reach only '/alpha/1/beta/1'.
		 */
	}

	/**
	 * Since sub-endpoints cannot exist without endpoints,
	 * and endpoints does not exist without controllers, this test allow to use controllers, and endpoints
	 */
	public function test_sub_endpoints() {
		// Arrange - '/alpha/{id}/beta'.
		$alpha_controller = new Standards\OnlyController\AlphaController();
		$this->manager->register_controller_instance( $alpha_controller );
		$this->manager->run_server();

		// Using only endpoints and controllers it can reach only '/alpha/1/', force to try sub-endpoints.
		$alpha_index_endpoint = $alpha_controller->get_endpoint_index();
		$beta_sub_endpoint = $alpha_index_endpoint->register_sub_endpoint( new Standards\OnlySubEndpoint\BetaSubEndpoint( $alpha_index_endpoint, '(?P<id>[\w]+)' ) );

		// Act - Reach '/alpha/1/beta'
		$result = $this->manager->run( 'alpha/index/beta', [
			'id' => '1',
		] );

		// Assert - '/alpha/1/beta'.
		$this->assertEquals( 'beta-items', $result );

		// Arrange - '/alpha/1/beta/1'.
		$beta_sub_endpoint->register_item_route( \WP_REST_Server::READABLE, [
			'id_arg_name' => 'sub_id',
		] );

		// Act - Reach '/alpha/1/beta/1'
		$result = $this->manager->run( 'alpha/index/beta', [
			'id' => '1',
			'sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1'.
		$this->assertEquals( 'beta-item', $result );

		// Arrange - '/alpha/{id}/beta/1/gamma'.
		$gamma_sub_endpoint = $beta_sub_endpoint->register_sub_endpoint( new Standards\OnlySubEndpoint\GammaSubEndpoint( $beta_sub_endpoint, '(?P<sub_id>[\w]+)' ) );

		// Act - Reach '/alpha/1/beta/1/gamma'
		$result = $this->manager->run( 'alpha/index/beta/gamma', [
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
		$result = $this->manager->run( 'alpha/index/beta/gamma', [
			'id' => '1',
			'sub_id' => '1',
			'sub_sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1/gamma/1'.
		$this->assertEquals( 'gamma-item', $result );
	}

	public function test_sub_endpoints_include_sub_controllers() {
		// Arrange - '/alpha/{id}/beta/1/gamma'.
		$alpha_controller = new Standards\OnlyController\AlphaController();
		$this->manager->register_controller_instance( $alpha_controller );
		$this->manager->run_server();

		$beta_controller = new Standards\OnlySubController\BetaController();
		$this->manager->register_controller_instance( $beta_controller );
		$beta_controller->do_register();

		$beta_index_endpoint = $beta_controller->get_endpoint_index();
		$gamma_sub_endpoint = $beta_index_endpoint->register_sub_endpoint( new Standards\OnlySubEndpoint\GammaSubEndpoint( $beta_index_endpoint, '(?P<sub_sub_id>[\w]+)' ) );

		// Act - Reach '/alpha/1/beta/1/gamma'
		$result = $this->manager->run( 'alpha/beta/index/gamma', [
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
		$result = $this->manager->run( 'alpha/beta/index/gamma', [
			'id' => '1',
			'sub_id' => '1',
			'sub_sub_id' => '1',
		] );

		// Assert - '/alpha/1/beta/1/gamma/1'.
		$this->assertEquals( 'gamma-item', $result );
	}
}
