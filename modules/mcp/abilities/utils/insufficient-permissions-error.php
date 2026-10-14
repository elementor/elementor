<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Components\Components_Access_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Insufficient_Permissions_Error {

	public static function for_action( string $action ): \WP_Error {
		return new \WP_Error(
			'insufficient_permissions',
			__( 'You do not have permission to perform this action.', 'elementor' ),
			[
				'status' => \WP_Http::FORBIDDEN,
				'action' => $action,
				'tier' => Components_Access_Controller::get_access_tier(),
			]
		);
	}
}
