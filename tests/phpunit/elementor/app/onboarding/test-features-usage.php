<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Onboarding;

use Elementor\App\Modules\Onboarding\Features_Usage;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Features_Usage extends Elementor_Test_Base {

	public function test_save_onboarding_features() {
		// Arrange
		$features_usage = new Features_Usage();
		$features = [ 'feature_1', 'feature_2' ];
		$data = json_encode( [
			'features' => $features,
		] );

		// Act
		$result = $features_usage->save_onboarding_features( $data );
		$option_value = get_option( Features_Usage::ONBOARDING_FEATURES_OPTION );

		// Assert
		$this->assertEquals( [
			'status' => 'success',
			'payload' => [],
		], $result );
		$this->assertEquals( $features, $option_value );
	}

	public function test_register() {
		// Arrange
		remove_all_filters( 'elementor/tracker/send_tracking_data_params' );
		$features = [ 'feature_1', 'feature_2' ];
		$data = json_encode( [
			'features' => $features,
		] );
		$features_usage = new Features_Usage();
		$features_usage->save_onboarding_features( $data );

		// Act.
		$features_usage->register();
		$usage = apply_filters( 'elementor/tracker/send_tracking_data_params', [
			'usages' => [
				'other_usage' => 'that_should_be_preserved',
			],
		] );

		// Assert.
		$this->assertEquals( [
			'usages' => [
				'other_usage' => 'that_should_be_preserved',
				'onboarding_features' => $features,
			],
		], $usage );
	}
}
