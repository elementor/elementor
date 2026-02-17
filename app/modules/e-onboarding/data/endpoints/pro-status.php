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
		if ( Utils::has_pro() || Utils::is_pro_installed_and_not_active() ) {
			return [
				'data' => [
					'shouldShowProInstallScreen' => false,
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
				'shouldShowProInstallScreen' => $has_pro_subscription,
			],
		];
	}
}
