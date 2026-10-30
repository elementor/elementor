<?php

namespace Elementor\Modules\ProSetupPromotion\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Modules\ProSetupPromotion\Dismissal;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dismiss extends Endpoint_Base {

	public function get_name(): string {
		return 'dismiss';
	}

	public function get_format(): string {
		return 'pro-setup-promotion';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route( WP_REST_Server::CREATABLE );
	}

	public function create_items( $request ) {
		Dismissal::record_dismissal();

		return [
			'data' => [
				'success' => true,
			],
		];
	}
}
