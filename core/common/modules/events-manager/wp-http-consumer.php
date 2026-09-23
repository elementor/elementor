<?php

namespace Elementor\Core\Common\Modules\EventsManager;

use ElementorDeps\ConsumerStrategies_AbstractConsumer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Sends the analytics SDK's batches through WordPress' non-blocking HTTP layer instead of the SDK's
 * default forked/blocking cURL consumer, so server-side event dispatch never adds latency to the
 * request that triggered it.
 */
class Wp_Http_Consumer extends ConsumerStrategies_AbstractConsumer {

	const REQUEST_TIMEOUT = 3;

	public function persist( $batch ): bool {
		if ( empty( $batch ) ) {
			Module::debug_log( 'persist skipped reason=empty_batch' );
			return true;
		}

		$protocol = ! empty( $this->_options['use_ssl'] ) ? 'https' : 'http';
		$url = $protocol . '://' . $this->_options['host'] . $this->_options['endpoint'];

		$encoded = $this->_encode( $batch );

		Module::debug_log( 'persist POST url=' . $url . ' batch_size=' . count( $batch ) . ' bytes=' . strlen( $encoded ) );

		$response = wp_safe_remote_post( $url, [
			'timeout' => self::REQUEST_TIMEOUT,
			'blocking' => false,
			'body' => [
				'data' => $encoded,
			],
		] );

		if ( is_wp_error( $response ) ) {
			Module::debug_log( 'persist wp_error msg=' . $response->get_error_message() );
			return false;
		}

		return true;
	}
}
