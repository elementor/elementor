<?php

namespace Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Module;
use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Install_Screen extends Endpoint_Base {

	public function get_name(): string {
		return 'pro-install-screen';
	}

	public function get_format(): string {
		return 'e-onboarding';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route();
	}

	public function get_items( $request ) {
		return [
			'data' => [
				'shouldShowProInstallScreen' => Module::should_show_pro_install_screen(),
			],
		];
	}
}
