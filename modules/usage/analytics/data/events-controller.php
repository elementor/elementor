<?php
namespace Elementor\Modules\Usage\Analytics\Data;

use Elementor\User;
use Elementor\Data\Base\Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Events_Controller extends Controller {
	const OPTION_NAME = 'elementor_analytics';

	public function get_name() {
		return 'analytics-events';
	}

	public function register_endpoints() {
		//
	}

	public function create_item( $request ) {
		// TODO: Create class foreach event

	}

	public function get_permission_callback( $request ) {
		return User::is_current_user_can_edit(
			$request->get_param( 'post_id' )
		);
	}
}
