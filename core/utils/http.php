<?php
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Http extends \WP_Http {
	/**
	 * Pass multiple urls to implements a fallback machine when one of the urls
	 * is sending an error or not exists anymore.
	 *
	 * @param array $urls
	 * @param array $args
	 *
	 * @return array|\WP_Error|null
	 */
	public function request_with_fallback( array $urls, $args = [] ) {
		$response = null;

		foreach ( $urls as $url ) {
			$response = $this->request( $url, $args );

			if ( $this->is_successful_response( $response ) ) {
				return $response;
			}
		}

		return $response;
	}

	/**
	 * @param $response
	 *
	 * @return bool
	 */
	private function is_successful_response( $response ) {
		if ( is_wp_error( $response ) ) {
			return false;
		}

		$response_code = (int) wp_remote_retrieve_response_code( $response );

		if ( ! $response_code || 500 === $response_code || 404 === $response_code ) {
			return false;
		}

		return true;
	}
}
