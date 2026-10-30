<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\ProSetupPromotion;

use Elementor\Modules\ProSetupPromotion\Data\Controller;
use Elementor\Modules\ProSetupPromotion\Data\Endpoints\Complete_Setup;
use Elementor\Modules\ProSetupPromotion\Setup_State;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Complete_Setup_Endpoint extends Elementor_Test_Base {

	private Complete_Setup $endpoint;

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'author' ] ) );

		$data_manager = Plugin::$instance->data_manager_v2;
		$data_manager->kill_server();

		$controller = $data_manager->get_controller( 'pro-setup-promotion' );

		if ( ! $controller ) {
			$controller = $data_manager->register_controller( new Controller() );
		}

		$data_manager->run_server();

		$this->endpoint = $controller->endpoints['pro-setup-promotion/complete-setup'];

		add_filter(
			'elementor/pro_setup_promotion/setup_state',
			static function (): string {
				return Setup_State::STATE_INSTALL;
			}
		);
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/pro_setup_promotion/setup_state' );
		Plugin::$instance->data_manager_v2->kill_server();

		parent::tearDown();
	}

	public function test_install_path_requires_install_and_activate_capabilities(): void {
		$result = $this->endpoint->create_items( new WP_REST_Request( 'POST' ) );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'insufficient_permissions', $result->get_error_code() );
	}
}
