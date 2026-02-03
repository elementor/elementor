<?php

namespace Elementor\App\Modules\OnboardingV2\Data\Endpoints;

use Elementor\App\Modules\OnboardingV2\Storage\Repository;
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
		return 'onboarding-v2/user-progress';
	}

	protected function register(): void {
		$this->register_items_route( WP_REST_Server::READABLE );
		$this->register_items_route( WP_REST_Server::EDITABLE );
	}

	public function get_items( $request ) {
		$repository = Repository::instance();
		$progress = $repository->get_progress();

		return [
			'data' => $progress->to_array(),
			'meta' => [
				'had_unexpected_exit' => $progress->had_unexpected_exit(),
			],
		];
	}

	public function update_items( $request ) {
		$repository = Repository::instance();
		$params = $request->get_json_params();

		$progress = $repository->update_progress( $params );

		return [
			'data' => 'success',
			'progress' => $progress->to_array(),
		];
	}
}
