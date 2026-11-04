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

	private int $admin_id;

	public function setUp(): void {
		parent::setUp();

		$this->admin_id = self::factory()->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $this->admin_id );

		add_filter(
			'elementor/pro_setup_promotion/editor_assets',
			static function (): array {
				return [ 'is_active' => true ];
			}
		);

		$data_manager = Plugin::$instance->data_manager_v2;
		$data_manager->kill_server();

		$controller = $data_manager->get_controller( 'pro-setup-promotion' );

		if ( ! $controller ) {
			$controller = $data_manager->register_controller( new Controller() );
		}

		$data_manager->run_server();

		$this->endpoint = $controller->endpoints['pro-setup-promotion/complete-setup'];
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/pro_setup_promotion/setup_state' );
		remove_all_filters( 'elementor/pro_setup_promotion/editor_assets' );
		Plugin::$instance->data_manager_v2->kill_server();

		parent::tearDown();
	}

	private function force_setup_state( string $state ): void {
		remove_all_filters( 'elementor/pro_setup_promotion/setup_state' );
		add_filter(
			'elementor/pro_setup_promotion/setup_state',
			static function () use ( $state ): string {
				return $state;
			}
		);
	}

	public function test_complete_setup_returns_invalid_state_when_install_not_actionable_for_user(): void {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'author' ] ) );
		$this->force_setup_state( Setup_State::STATE_INSTALL );

		$result = $this->endpoint->create_items( new WP_REST_Request( 'POST' ) );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_state', $result->get_error_code() );
	}

	public function test_connect_state_returns_invalid_state_from_complete_setup(): void {
		wp_set_current_user( $this->admin_id );
		$this->force_setup_state( Setup_State::STATE_CONNECT );

		$result = $this->endpoint->create_items( new WP_REST_Request( 'POST' ) );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_state', $result->get_error_code() );
	}

	public function test_success_response_requests_reload_without_promotion_when_connect_url_missing(): void {
		$this->force_setup_state( Setup_State::STATE_CONNECT );

		$method = new \ReflectionMethod( Complete_Setup::class, 'success_response' );
		$method->setAccessible( true );

		/** @var array $response */
		$response = $method->invoke( $this->endpoint, 'activate', false );

		$this->assertTrue( $response['data']['reload'] );
		$this->assertNull( $response['data']['proSetupPromotion'] );
	}

	public function test_success_response_keeps_promotion_config_when_reload_flag_without_missing_connect_url(): void {
		$this->force_setup_state( Setup_State::STATE_INSTALL );

		$method = new \ReflectionMethod( Complete_Setup::class, 'success_response' );
		$method->setAccessible( true );

		/** @var array $response */
		$response = $method->invoke( $this->endpoint, 'install', true );

		$this->assertTrue( $response['data']['reload'] );
		$this->assertIsArray( $response['data']['proSetupPromotion'] );
		$this->assertSame( Setup_State::STATE_INSTALL, $response['data']['proSetupPromotion']['state'] );
	}
}
