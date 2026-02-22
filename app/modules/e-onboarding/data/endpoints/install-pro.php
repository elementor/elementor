<?php

namespace Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Modules\ProInstall\Plugin_Installer;
use Elementor\Plugin;
use Elementor\Utils;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Install_Pro extends Endpoint_Base {

	public function get_name(): string {
		return 'install-pro';
	}

	public function get_format(): string {
		return 'e-onboarding';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route( WP_REST_Server::CREATABLE );
	}

	public function create_items( $request ) {
		if ( Utils::has_pro() || Utils::is_pro_installed_and_not_active() ) {
			return [
				'data' => [
					'success' => true,
					'message' => 'already_installed',
				],
			];
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
				__( 'You must be connected to install Elementor Pro.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		$download_link = $pro_install_app->get_download_link();

		if ( empty( $download_link ) ) {
			return new \WP_Error(
				'no_subscription',
				__( 'There are no available subscriptions at the moment.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		$plugin_installer = new Plugin_Installer( 'elementor-pro', $download_link );
		$result = $plugin_installer->install();

		if ( is_wp_error( $result ) ) {
			return new \WP_Error(
				'install_failed',
				$result->get_error_message(),
				[ 'status' => 500 ]
			);
		}

		return [
			'data' => [
				'success' => true,
				'message' => 'installed',
			],
		];
	}
}
