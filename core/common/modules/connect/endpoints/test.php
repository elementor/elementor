<?php

namespace Elementor\Core\Common\Modules\Connect\Endpoints;

use Elementor\Core\Common\Modules\Connect\Tests\Connect_Test;
use Elementor\Core\Utils\Testing\Cluster;
use Elementor\Core\Utils\Testing\Diagnostics;
use Elementor\Data\V2\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test extends Endpoint {
	public function get_name() {
		return 'test';
	}

	public function get_format() {
		return 'connect/test';
	}

	protected function register() {
		parent::register();

		$this->register_items_route( \WP_REST_Server::READABLE, [] );
	}

	public function get_items( $request ) {
		$cluster = ( new Cluster( [ Connect_Test::class ], [] ) );
		$cluster->run();

		return (
			new Diagnostics(
				$cluster->get_diagnosables()
			)
		)->to_array();
	}
}
