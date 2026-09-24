<?php

namespace Elementor\App\Modules\Onboarding;

use Elementor\Tracker;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Features_Usage {

	const ONBOARDING_FEATURES_OPTION = '_elementor_onboarding_features';

	public function register() {
		if ( ! Tracker::is_allow_track() ) {
			return;
		}

		add_filter( 'elementor/tracker/send_tracking_data_params', function ( array $params ) {
			$params['usages']['onboarding_features'] = $this->get_usage_data();

			return $params;
		} );
	}

	public function save_onboarding_features( $raw_post_data ) {
		if ( empty( $raw_post_data ) ) {
			return;
		}

		$post_data = json_decode( $raw_post_data, true );

		if ( empty( $post_data['features'] ) ) {
			return;
		}

		$sanitized_features = $this->sanitize_features( $post_data['features'] );

		if ( null === $sanitized_features ) {
			return [
				'status' => 'error',
				'payload' => [
					'error_message' => esc_html__( 'There was a problem saving your selected features.', 'elementor' ),
				],
			];
		}

		update_option( static::ONBOARDING_FEATURES_OPTION, $sanitized_features );

		return [
			'status' => 'success',
			'payload' => [],
		];
	}

	/**
	 * Sanitize the features selection payload.
	 *
	 * Expects an associative array of known tiers, each holding a list of
	 * free-text feature labels (see assets/js/utils/utils.js), e.g.:
	 * [ 'essential' => [ 'Templates & Theme Builder' ], 'advanced' => [], 'one' => [] ].
	 *
	 * @param mixed $features
	 *
	 * @return array|null Sanitized array, or null if the payload shape is invalid.
	 */
	private function sanitize_features( $features ) {
		if ( ! is_array( $features ) ) {
			return null;
		}

		$allowed_tiers = [ 'essential', 'advanced', 'one' ];
		$sanitized = [];

		foreach ( $features as $tier => $selected_labels ) {
			if ( ! in_array( $tier, $allowed_tiers, true ) || ! is_array( $selected_labels ) ) {
				return null;
			}

			$sanitized[ $tier ] = array_values( array_map( function ( $label ) {
				return is_string( $label ) ? sanitize_text_field( $label ) : null;
			}, $selected_labels ) );

			if ( in_array( null, $sanitized[ $tier ], true ) ) {
				return null;
			}
		}

		return $sanitized;
	}

	private function get_usage_data() {
		return get_option( static::ONBOARDING_FEATURES_OPTION, [] );
	}
}
