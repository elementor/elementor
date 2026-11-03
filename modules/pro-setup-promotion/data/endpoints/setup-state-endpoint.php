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

		$this->register_items_route( WP_REST_Server::READABLE, $this->get_items_route_args() );
	}

	protected function get_items_route_args(): array {
		return [
			'refresh_license' => [
				'description' => 'When true, refresh Pro license data from Elementor servers before resolving setup state.',
				'type' => 'boolean',
				'default' => false,
				'sanitize_callback' => 'rest_sanitize_boolean',
				'validate_callback' => 'rest_validate_request_arg',
			],
		];
	}

	public function get_items( $request ) {
		if ( rest_sanitize_boolean( $request->get_param( 'refresh_license' ) ) ) {
			Setup_State::refresh_pro_license_from_remote();
		}

		return [
			'data' => [
				'proSetupPromotion' => Setup_State::get_editor_config(),
			],
		];
	}
}
