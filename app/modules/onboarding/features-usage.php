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

	public function save_onboarding_features() {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( empty( $_POST['data'] ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		$data = json_decode( Utils::get_super_global_value( $_POST, 'data' ), true );

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
