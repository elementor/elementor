<?php

namespace Elementor\Core\Common\Modules\Connect\Checks;

use Elementor\Core\Utils\Checking\Check;
use Elementor\Plugin;

class Health_Check extends Check {
	private $response;
	private $original_url;
	private $actual_url;

	public function __construct( $configuration = null ) {
		parent::__construct( $configuration );

		add_filter( 'wp_die_handler', function() {
			return function( $error ) {
				if ( $error instanceof \WP_Error ) {
					throw new \Exception( $error->get_error_message() );
				}

				throw new \Exception( (string) $error );
			};
		} );

		add_action( 'requests-requests.before_request', function( &$url ) {
			$this->original_url = $url;
		}, 0 );

		add_action( 'requests-requests.before_request', function( &$url ) {
			$this->actual_url = $url;
		}, 99999 );

		$this->response = Plugin::$instance->common->get_component( 'connect' )->get_app( 'connect' )
            ->get_token_request();
	}

	public function check_connect_response_is_200() {
		// Assert
		$this->expect( $this->response )
			->describe( 'The response should end up with a status code of 200' )
			->to_meet( function( $subject ) {
				$expect = ! array_keys( $subject->errors );
				if ( ! $expect ) {
					throw new \Exception( 'The request ended up with status code ' . array_keys( $subject->errors )[0] );
				}
				return $expect;
			} );
	}

	public function check_connect_url_is_valid() {
		// Assert
		$this->expect( $this->actual_url )
			->describe( 'The actual url should be equal to the original one' )
			->to_meet( function( $actual ) {
				$expect = $actual === $this->original_url;

				if ( ! $expect ) {
					throw new \Exception(
						sprintf(
							'The actual url is not equal to the original (actual: %s, original: %s)',
							$actual,
							$this->original_url
						)
					);
				}

				return $expect;
			} );
	}
}
