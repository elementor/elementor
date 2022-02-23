<?php

namespace Elementor\Core\Common\Modules\Connect\Endpoints;

use Elementor\Core\Common\Modules\Connect\Checks\Health_Check as Health_Check_Class;
use Elementor\Core\Utils\Checking\Cluster;
use Elementor\Data\V2\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Health_Check extends Endpoint {
	public function get_name() {
		return 'health-check';
	}

	public function get_format() {
		return 'connect/heath-check';
	}

	protected function register() {
		parent::register();

		$this->register_items_route( \WP_REST_Server::READABLE, [] );
	}

	public function get_items( $request ) {
		return ( new Cluster( [ Health_Check_Class::class ], [] ) )
			->run()
			->diagnose()
			->to_array()['diagnosables'];
	}
}
