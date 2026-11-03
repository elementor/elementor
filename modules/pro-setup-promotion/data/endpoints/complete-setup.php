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
		$config = Setup_State::get_editor_config_after_plugin_change();
		$needs_editor_reload = $reload;

		if (
			is_array( $config )
			&& Setup_State::STATE_CONNECT === $config['state']
			&& empty( $config['connectUrl'] )
		) {
			$needs_editor_reload = true;
		}

		return [
			'data' => [
				'success' => true,
				'action' => $action,
				'reload' => $needs_editor_reload,
				'proSetupPromotion' => $needs_editor_reload ? null : $config,
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
		} catch ( \Throwable $throwable ) {
			Plugin::$instance->logger->get_logger()->error(
				'Pro setup promotion complete-setup failed.',
				[
					'exception' => get_class( $throwable ),
					'message' => $throwable->getMessage(),
				]
			);

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
			return $this->log_and_generic_installer_error( $result, 'install' );
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

		if ( ! Setup_State::is_pro_installed_and_inactive_in_wordpress() ) {
			return new \WP_Error(
				'not_installed',
				__( 'Elementor Pro is not installed.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		$plugin_installer = new Plugin_Installer( 'elementor-pro' );
		$result = $plugin_installer->activate();

		if ( is_wp_error( $result ) ) {
			if ( in_array( $result->get_error_code(), [ 'already_active', 'plugin_already_active' ], true ) ) {
				return $this->success_response( 'activate' );
			}

			return $this->log_and_generic_installer_error( $result, 'activate' );
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

	private function log_and_generic_installer_error( \WP_Error $result, string $action ): \WP_Error {
		Plugin::$instance->logger->get_logger()->error(
			'Pro setup promotion installer failed.',
			[
				'action' => $action,
				'code' => $result->get_error_code(),
				'message' => $result->get_error_message(),
			]
		);

		$message = 'install' === $action
			? __( 'We couldn\'t install Elementor Pro. Please try again.', 'elementor' )
			: __( 'We couldn\'t activate Elementor Pro. Please try again.', 'elementor' );

		return new \WP_Error(
			$action . '_failed',
			$message,
			[ 'status' => 500 ]
		);
	}
}
