<?php

namespace Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Status extends Endpoint_Base {

	public function get_name(): string {
		return 'pro-status';
	}

	public function get_format(): string {
		return 'e-onboarding';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route();
	}

	public function get_items( $request ) {
		$permission = $this->check_permission();
		if ( is_wp_error( $permission ) ) {
			return $permission;
		}

		if ( Utils::has_pro() || Utils::is_pro_installed_and_not_active() ) {
			return [
				'data' => [
					'hasProSubscription' => false,
				],
			];
		}

		$has_pro_subscription = false;
		$connect = Plugin::$instance->common->get_component( 'connect' );

		if ( $connect ) {
			$pro_install_app = $connect->get_app( 'pro-install' );

			if ( $pro_install_app && $pro_install_app->is_connected() ) {
				$download_link = $pro_install_app->get_download_link();
				$has_pro_subscription = ! empty( $download_link );
			}
		}

		return [
			'data' => [
				'hasProSubscription' => $has_pro_subscription,
			],
		];
	}

	private function check_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to access e-onboarding data.', 'elementor' ),
				[ 'status' => 403 ]
			);
		}
		return true;
	}
}
