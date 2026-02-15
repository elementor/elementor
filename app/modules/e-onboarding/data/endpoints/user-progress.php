<?php

namespace Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Storage\Onboarding_Progress_Manager;
use Elementor\App\Modules\E_Onboarding\Validation\User_Progress_Validator;
use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Progress extends Endpoint_Base {

	public function get_name(): string {
		return 'user-progress';
	}

	public function get_format(): string {
		return 'e-onboarding';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route( WP_REST_Server::EDITABLE );
	}

	public function get_items( $request ) {
		$permission = $this->check_permission();
		if ( is_wp_error( $permission ) ) {
			return $permission;
		}

		$manager = Onboarding_Progress_Manager::instance();
		$progress = $manager->get_progress();

		return [
			'data' => $progress->to_array(),
			'meta' => [
				'had_unexpected_exit' => $progress->had_unexpected_exit(),
			],
		];
	}

	public function update_items( $request ) {
		$permission = $this->check_permission();
		if ( is_wp_error( $permission ) ) {
			return $permission;
		}

		$params = $request->get_json_params();

		$validator = new User_Progress_Validator();
		$validated = $validator->validate( $params ?? [] );

		if ( is_wp_error( $validated ) ) {
			return $validated;
		}

		$manager = Onboarding_Progress_Manager::instance();
		$progress = $manager->update_progress( $validated );

		return [
			'data' => 'success',
			'progress' => $progress->to_array(),
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
