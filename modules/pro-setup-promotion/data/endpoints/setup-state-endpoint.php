<?php

namespace Elementor\Modules\ProSetupPromotion\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Modules\ProSetupPromotion\Setup_State;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Setup_State_Endpoint extends Endpoint_Base {

	public function get_name(): string {
		return 'setup-state';
	}

	public function get_format(): string {
		return 'pro-setup-promotion';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route( WP_REST_Server::READABLE );
	}

	public function get_items( $request ) {
		return [
			'data' => [
				'proSetupPromotion' => Setup_State::get_editor_config(),
			],
		];
	}
}
