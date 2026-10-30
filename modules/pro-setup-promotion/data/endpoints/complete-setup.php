<?php

namespace Elementor\Modules\ProSetupPromotion\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Modules\ProInstall\Plugin_Installer;
use Elementor\Modules\ProSetupPromotion\Setup_State;
use Elementor\Plugin;
use Elementor\Utils;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Complete_Setup extends Endpoint_Base {

	public function get_name(): string {
		return 'complete-setup';
	}

	public function get_format(): string {
		return 'pro-setup-promotion';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route( WP_REST_Server::CREATABLE );
	}

	private function success_response( string $action, bool $reload = false ): array {
		return [
			'data' => [
				'success' => true,
				'action' => $action,
				'reload' => $reload,
				'proSetupPromotion' => Setup_State::get_editor_config_after_plugin_change(),
			],
		];
	}

	public function create_items( $request ) {
		try {
			$state = Setup_State::resolve();

			if ( Setup_State::STATE_INSTALL === $state ) {
				return $this->install_and_activate_pro();
			}

			if ( Setup_State::STATE_ACTIVATE === $state ) {
				return $this->activate_pro();
			}

			return new \WP_Error(
				'invalid_state',
				__( 'Setup action is not available for the current state.', 'elementor' ),
				[ 'status' => 400 ]
			);
		} catch ( \Throwable ) {
			return new \WP_Error(
				'setup_failed',
				__( 'Elementor Pro setup failed. Please try again.', 'elementor' ),
				[ 'status' => 500 ]
			);
		}
	}

	private function install_and_activate_pro() {
		if ( ! current_user_can( 'install_plugins' ) || ! current_user_can( 'activate_plugins' ) ) {
			return new \WP_Error(
				'insufficient_permissions',
				__( 'You do not have permission to install plugins.', 'elementor' ),
				[ 'status' => 403 ]
			);
		}

		$connect = Plugin::$instance->common->get_component( 'connect' );

		if ( ! $connect ) {
			return new \WP_Error(
				'connect_unavailable',
				__( 'Connect module is not available.', 'elementor' ),
				[ 'status' => 500 ]
			);
		}

		$pro_install_app = $connect->get_app( 'pro-install' );

		if ( ! $pro_install_app || ! $pro_install_app->is_connected() ) {
			return new \WP_Error(
				'not_connected',
				__( 'Connect your Elementor account to install Pro.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		$download_link = $pro_install_app->get_download_link();

		if ( empty( $download_link ) ) {
			return new \WP_Error(
				'no_subscription',
				__( 'We couldn\'t find an eligible Pro subscription on your connected account.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		$plugin_installer = new Plugin_Installer( 'elementor-pro', $download_link );
		$result = $plugin_installer->install();

		if ( is_wp_error( $result ) ) {
			return new \WP_Error(
				'install_failed',
				wp_strip_all_tags( $result->get_error_message() ),
				[ 'status' => 500 ]
			);
		}

		return $this->success_response( 'install' );
	}

	private function activate_pro() {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return new \WP_Error(
				'insufficient_permissions',
				__( 'You do not have permission to activate plugins.', 'elementor' ),
				[ 'status' => 403 ]
			);
		}

		if ( Utils::has_pro() ) {
			return $this->success_response( 'activate' );
		}

		if ( ! Utils::is_pro_installed_and_not_active() ) {
			return new \WP_Error(
				'not_installed',
				__( 'Elementor Pro is not installed.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		$plugin_installer = new Plugin_Installer( 'elementor-pro' );
		$result = $plugin_installer->activate();

		if ( is_wp_error( $result ) ) {
			$error_code = $result->get_error_code();

			if ( in_array( $error_code, [ 'already_active', 'plugin_already_active' ], true ) ) {
				return $this->success_response( 'activate' );
			}

			return new \WP_Error(
				'activate_failed',
				wp_strip_all_tags( $result->get_error_message() ),
				[
					'status' => 500,
					'error_code' => $error_code,
				]
			);
		}

		if ( true !== $result ) {
			return new \WP_Error(
				'activate_failed',
				__( 'We couldn\'t activate Elementor Pro. Please try again.', 'elementor' ),
				[ 'status' => 500 ]
			);
		}

		return $this->success_response( 'activate' );
	}
}
