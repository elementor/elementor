<?php

namespace Elementor\Core\Common\Modules\Connect\Tests;

use Elementor\Core\Utils\Testing\Test;
use Elementor\Plugin;

class Connect_Test extends Test {
	public function test_connect_response_is_200() {
		// Arrange
		$response = Plugin::$instance->common->get_component( 'connect' )->get_app( 'connect' )
			->get_token_request();

		$this->expect( property_exists( $response, 'code' ) )
			->describe( 'The `code` property doesn\'t exist in the response, which means it ended up with 200' )
			->to_meet( function( $subject ) {
				return true;
			} );
	}
}
