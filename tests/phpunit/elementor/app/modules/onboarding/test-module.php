<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\Onboarding;

use Elementor\App\Modules\Onboarding\Module;
use Elementor\Plugin;
use ReflectionMethod;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Test_Base {

	public function test_steps_exclude_site_features_when_pro_active() {
		add_filter( 'elementor/onboarding/is_elementor_pro_installed', '__return_true' );
		try {
			$_GET['page'] = 'elementor-app';
			do_action( 'elementor/init' );

			$settings = Plugin::$instance->app->get_settings( 'onboarding' );
			$this->assertIsArray( $settings );
			$this->assertArrayHasKey( 'steps', $settings );

			$step_ids = array_column( $settings['steps'], 'id' );
			$this->assertNotContains( 'site_features', $step_ids );
		} finally {
			remove_filter( 'elementor/onboarding/is_elementor_pro_installed', '__return_true' );
		}
	}

	public function test_steps_include_site_features_when_pro_not_active() {
		$_GET['page'] = 'elementor-app';
		do_action( 'elementor/init' );

		$settings = Plugin::$instance->app->get_settings( 'onboarding' );
		$this->assertIsArray( $settings );
		$this->assertArrayHasKey( 'steps', $settings );

		$step_ids = array_column( $settings['steps'], 'id' );
		$this->assertContains( 'site_features', $step_ids );
	}

	public function test_steps_exclude_theme_selection_when_elementor_theme_active() {
		add_filter( 'elementor/onboarding/is_elementor_theme_active', '__return_true' );
		try {
			$_GET['page'] = 'elementor-app';
			do_action( 'elementor/init' );

			$settings = Plugin::$instance->app->get_settings( 'onboarding' );
			$this->assertIsArray( $settings );
			$this->assertArrayHasKey( 'steps', $settings );

			$step_ids = array_column( $settings['steps'], 'id' );
			$this->assertNotContains( 'theme_selection', $step_ids );
		} finally {
			remove_filter( 'elementor/onboarding/is_elementor_theme_active', '__return_true' );
		}
	}

	public function test_steps_include_theme_selection_when_elementor_theme_not_active() {
		add_filter( 'elementor/onboarding/is_elementor_theme_active', '__return_false' );
		try {
			$_GET['page'] = 'elementor-app';
			do_action( 'elementor/init' );

			$settings = Plugin::$instance->app->get_settings( 'onboarding' );
			$this->assertIsArray( $settings );
			$this->assertArrayHasKey( 'steps', $settings );

			$step_ids = array_column( $settings['steps'], 'id' );
			$this->assertContains( 'theme_selection', $step_ids );
		} finally {
			remove_filter( 'elementor/onboarding/is_elementor_theme_active', '__return_false' );
		}
	}

	public function test_get_onboarding_locale_exact_match() {
		$callback = fn() => 'de_DE';
		add_filter( 'locale', $callback );

		try {
			$result = $this->invoke_get_onboarding_locale();
			$this->assertEquals( 'de_DE', $result );
		} finally {
			remove_filter( 'locale', $callback );
		}
	}

	public function test_get_onboarding_locale_fallback_to_language() {
		$callback = fn() => 'de_AT';
		add_filter( 'locale', $callback );

		try {
			$result = $this->invoke_get_onboarding_locale();
			$this->assertEquals( 'de_DE', $result );
		} finally {
			remove_filter( 'locale', $callback );
		}
	}

	public function test_get_onboarding_locale_returns_default_for_unsupported() {
		$callback = fn() => 'ja_JP';
		add_filter( 'locale', $callback );

		try {
			$result = $this->invoke_get_onboarding_locale();
			$this->assertEquals( 'en', $result );
		} finally {
			remove_filter( 'locale', $callback );
		}
	}

	private function invoke_get_onboarding_locale(): string {
		$module = new Module();
		$method = new ReflectionMethod( $module, 'get_onboarding_locale' );
		$method->setAccessible( true );

		return $method->invoke( $module );
	}
}
