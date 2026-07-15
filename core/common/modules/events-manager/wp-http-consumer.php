<?php

namespace Elementor\Core\Common\Modules\EventsManager;

use ConsumerStrategies_AbstractConsumer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Sends Mixpanel PHP SDK batches through WordPress' non-blocking HTTP layer instead of the SDK's
 * default forked/blocking cURL consumer, so server-side event dispatch never adds latency to the
 * request that triggered it.
 */
class Wp_Http_Consumer extends ConsumerStrategies_AbstractConsumer {

	const REQUEST_TIMEOUT = 3;

	public function persist( $batch ): bool {
		if ( empty( $batch ) ) {
			return true;
		}

		$protocol = ! empty( $this->_options['use_ssl'] ) ? 'https' : 'http';
		$url = $protocol . '://' . $this->_options['host'] . $this->_options['endpoint'];

		$response = wp_safe_remote_post( $url, [
			'timeout' => self::REQUEST_TIMEOUT,
			'blocking' => false,
			'body' => [
				'data' => $this->_encode( $batch ),
			],
		] );

		return ! is_wp_error( $response );
	}
}
