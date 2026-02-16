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
		$this->ensure_pro_defined();

		$_GET['page'] = 'elementor-app';
		do_action( 'elementor/init' );

		$settings = Plugin::$instance->app->get_settings( 'e-onboarding' );
		$this->assertIsArray( $settings );
		$this->assertArrayHasKey( 'steps', $settings );

		$step_ids = array_column( $settings['steps'], 'id' );
		$this->assertNotContains( 'site_features', $step_ids );
	}

	public function test_steps_include_site_features_when_pro_not_active() {
		if ( defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			$this->markTestSkipped( 'Cannot test free version behavior when Pro is already active' );
		}

		$_GET['page'] = 'elementor-app';
		do_action( 'elementor/init' );

		$settings = Plugin::$instance->app->get_settings( 'e-onboarding' );
		$this->assertIsArray( $settings );
		$this->assertArrayHasKey( 'steps', $settings );

		$step_ids = array_column( $settings['steps'], 'id' );
		$this->assertContains( 'site_features', $step_ids );
	}

	private function ensure_pro_defined(): void {
		if ( ! defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			define( 'ELEMENTOR_PRO_VERSION', '99.99.99' );
		}
	}
}
