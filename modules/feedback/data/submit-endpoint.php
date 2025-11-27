<?php

namespace Elementor\Modules\Feedback\Data;

use Elementor\Data\V2\Base\Endpoint;


if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

class Submit_Endpoint extends Endpoint
{
	public function get_name()
	{
		return 'feedback/submit';
	}

	public function get_format() {
		return 'feedback/submit';
	}

	protected function register() {
		parent::register();
		$this->register_route( '', \WP_REST_Server::CREATABLE );
	}

	public function create_items( $request ) {
		
	}
}
