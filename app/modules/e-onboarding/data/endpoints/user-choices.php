<?php

namespace Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Storage\Repository;
use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Choices extends Endpoint_Base {

	public function get_name(): string {
		return 'user-choices';
	}

	public function get_format(): string {
		return 'e-onboarding';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route( WP_REST_Server::EDITABLE );
	}

	public function get_items( $request ) {
		$repository = Repository::instance();
		$choices = $repository->get_choices();

		return [
			'data' => $choices->to_array(),
		];
	}

	public function update_items( $request ) {
		$repository = Repository::instance();
		$params = $request->get_json_params();

		$choices = $repository->update_choices( $params );

		return [
			'data' => 'success',
			'choices' => $choices->to_array(),
		];
	}
}
