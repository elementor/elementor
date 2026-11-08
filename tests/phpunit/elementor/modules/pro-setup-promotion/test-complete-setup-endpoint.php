<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\ProSetupPromotion;

use Elementor\Modules\ProSetupPromotion\Data\Controller;
use Elementor\Modules\ProSetupPromotion\Data\Endpoints\Complete_Setup;
use Elementor\Modules\ProSetupPromotion\Setup_State;
use Elementor\Plugin;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Complete_Setup_Endpoint extends Elementor_Test_Base {

	private const PRO_PLUGIN_FILE = 'elementor-pro/elementor-pro.php';

	private Complete_Setup $endpoint;

	private int $admin_id;

	public function setUp(): void {
		parent::setUp();

		$this->admin_id = self::factory()->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $this->admin_id );

		if ( is_multisite() ) {
			grant_super_admin( $this->admin_id );
		}

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
		$this->remove_elementor_pro_plugin_stub();
	}

	public function tearDown(): void {
		if ( is_multisite() ) {
			revoke_super_admin( $this->admin_id );
		}

		$this->remove_elementor_pro_plugin_stub();
		remove_all_filters( 'elementor/pro_setup_promotion/setup_state' );
		remove_all_filters( 'elementor/pro_setup_promotion/editor_assets' );
		Plugin::$instance->data_manager_v2->kill_server();

		parent::tearDown();
	}

	private function seed_elementor_pro_plugin_on_disk(): void {
		$plugin_dir = WP_PLUGIN_DIR . '/elementor-pro';

		if ( ! is_dir( $plugin_dir ) ) {
			wp_mkdir_p( $plugin_dir );
		}

		$plugin_path = $plugin_dir . '/elementor-pro.php';

		if ( ! file_exists( $plugin_path ) ) {
			file_put_contents(
				$plugin_path,
				"<?php\n/**\n * Plugin Name: Elementor Pro\n * Version: 1.0.0\n */\n"
			);
		}

		wp_clean_plugins_cache();
	}

	private function remove_elementor_pro_plugin_stub(): void {
		remove_all_filters( 'pre_option_active_plugins' );
		remove_all_filters( 'pre_site_option_active_sitewide_plugins' );

		deactivate_plugins( self::PRO_PLUGIN_FILE, true );

		$plugin_dir = WP_PLUGIN_DIR . '/elementor-pro';
		$plugin_path = $plugin_dir . '/elementor-pro.php';

		if ( file_exists( $plugin_path ) ) {
			wp_delete_file( $plugin_path );
		}

		if ( is_dir( $plugin_dir ) ) {
			@rmdir( $plugin_dir );
		}

		wp_clean_plugins_cache();
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

	public function test_complete_setup_requests_reload_without_promotion_when_connect_url_missing(): void {
		if ( Utils::has_pro() ) {
			$this->markTestSkipped( 'Activate-step complete-setup is not exercised when Elementor Pro is already loaded.' );
		}

		wp_set_current_user( $this->admin_id );
		$this->seed_elementor_pro_plugin_on_disk();
		deactivate_plugins( self::PRO_PLUGIN_FILE, true );
		wp_clean_plugins_cache();

		$this->assertSame( Setup_State::STATE_ACTIVATE, Setup_State::resolve() );

		$result = $this->endpoint->create_items( new WP_REST_Request( 'POST' ) );

		$this->assertNotInstanceOf( \WP_Error::class, $result );
		$this->assertIsArray( $result );
		$this->assertTrue( $result['data']['success'] );
		$this->assertSame( 'activate', $result['data']['action'] );
		$this->assertTrue( $result['data']['reload'] );
		$this->assertNull( $result['data']['proSetupPromotion'] );
		$this->assertSame( 'missing_connect_url', $result['data']['reloadReason'] );
	}
}
