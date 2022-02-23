<?php

namespace Elementor\Core\Common\Modules\Connect\Checks;

use Elementor\Core\Utils\Checking\Check;
use Elementor\Plugin;

class Health_Check extends Check {
	public function check_connect_response_is_200() {
		// Arrange
		add_filter( 'wp_die_handler', function() {
			return function() {};
		} );

		$response = Plugin::$instance->common->get_component( 'connect' )->get_app( 'connect' )
			->get_token_request();

		// Assert
		$this->expect( $response )
			->describe( 'The response had no errors, which means it ended up with 200' )
			->to_meet( function( $subject ) {
				return ! array_keys( $subject->errors );
			} );
	}
}
