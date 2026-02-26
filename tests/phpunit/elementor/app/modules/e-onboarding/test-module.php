<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Test_Base {

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->experiments->set_feature_default_state( 'e_onboarding', 'active' );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state( 'e_onboarding', 'inactive' );

		parent::tearDown();
	}

	public function test_steps_exclude_site_features_when_pro_active() {
		add_filter( 'elementor/e-onboarding/is_elementor_pro_installed', '__return_true' );
		try {
			$_GET['page'] = 'elementor-app';
			do_action( 'elementor/init' );

			$settings = Plugin::$instance->app->get_settings( 'e-onboarding' );
			$this->assertIsArray( $settings );
			$this->assertArrayHasKey( 'steps', $settings );

			$step_ids = array_column( $settings['steps'], 'id' );
			$this->assertNotContains( 'site_features', $step_ids );
		} finally {
			remove_filter( 'elementor/e-onboarding/is_elementor_pro_installed', '__return_true' );
		}
	}

	public function test_steps_include_site_features_when_pro_not_active() {
		$_GET['page'] = 'elementor-app';
		do_action( 'elementor/init' );

		$settings = Plugin::$instance->app->get_settings( 'e-onboarding' );
		$this->assertIsArray( $settings );
		$this->assertArrayHasKey( 'steps', $settings );

		$step_ids = array_column( $settings['steps'], 'id' );
		$this->assertContains( 'site_features', $step_ids );
	}
}
