<?php

namespace Elementor\App\Modules\Onboarding;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Features_Usage {

	const ONBOARDING_FEATURES_OPTION = '_elementor_onboarding_features';

	public function register() {
		add_filter( 'elementor/tracker/send_tracking_data_params', function ( array $params ) {
			$params['usages']['onboarding_features'] = $this->get_usage_data();

			return $params;
		} );
	}

	public function save_onboarding_features( $data ) {
		if ( empty( $data ) ) {
			return;
		}

		$data = json_decode( $data, true );

		if ( empty( $data['features'] ) ) {
			return;
		}

		update_option( static::ONBOARDING_FEATURES_OPTION, $data['features'] );

		return [
			'status' => 'success',
			'payload' => [],
		];
	}

	private function get_usage_data() {
		return get_option( static::ONBOARDING_FEATURES_OPTION, [] );
	}
}
