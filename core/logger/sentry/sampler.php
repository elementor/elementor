<?php
namespace Elementor\Core\Logger\Sentry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Sampler {

	const DEFAULT_SAMPLE_RATE = 0.01;

	const HASH_BUCKET_MAX = 4294967296;

	public function get_sample_rate() {
		/**
		 * Sample rate for Sentry fatal error reports.
		 *
		 * @param float $rate Value between 0 and 1.
		 */
		$rate = (float) apply_filters( 'elementor/logger/sentry_sample_rate', self::DEFAULT_SAMPLE_RATE );

		if ( $rate <= 0 ) {
			return 0.0;
		}

		if ( $rate >= 1 ) {
			return 1.0;
		}

		return $rate;
	}

	public function should_sample( array $fingerprint ) {
		$rate = $this->get_sample_rate();

		if ( 0.0 === $rate ) {
			return false;
		}

		if ( 1.0 === $rate ) {
			return true;
		}

		$hash_input = $this->get_site_salt() . '|' . implode( '|', $fingerprint );
		$hash = md5( $hash_input );
		$bucket = hexdec( substr( $hash, 0, 8 ) ) / self::HASH_BUCKET_MAX;

		return $bucket < $rate;
	}

	private function get_site_salt() {
		return wp_salt( 'elementor_sentry' );
	}
}
