<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\Onboarding;

use Elementor\App\Modules\Onboarding\Module;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
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

	public function test_onboarding_config_includes_planner_exit_when_experiment_active_and_url_configured() {
		if ( ! defined( 'ELEMENTOR_SITE_BUILDER_URL' ) || '' === ELEMENTOR_SITE_BUILDER_URL ) {
			$this->markTestSkipped( 'ELEMENTOR_SITE_BUILDER_URL is not defined in this environment.' );
		}

		$this->activate_onboarding_planner_exit_experiment();

		try {
			$_GET['page'] = 'elementor-app';
			do_action( 'elementor/init' );

			$settings = Plugin::$instance->app->get_settings( 'onboarding' );

			$this->assertTrue( $settings['shouldRedirectToSitePlanner'] );
			$this->assertSame( ELEMENTOR_SITE_BUILDER_URL, $settings['siteBuilderUrl'] );
		} finally {
			$this->deactivate_onboarding_planner_exit_experiment();
		}
	}

	public function test_onboarding_config_excludes_planner_exit_when_url_not_configured() {
		if ( defined( 'ELEMENTOR_SITE_BUILDER_URL' ) && '' !== ELEMENTOR_SITE_BUILDER_URL ) {
			$this->markTestSkipped( 'ELEMENTOR_SITE_BUILDER_URL is defined in this environment.' );
		}

		$this->activate_onboarding_planner_exit_experiment();

		try {
			$_GET['page'] = 'elementor-app';
			do_action( 'elementor/init' );

			$settings = Plugin::$instance->app->get_settings( 'onboarding' );

			$this->assertFalse( $settings['shouldRedirectToSitePlanner'] );
			$this->assertSame( '', $settings['siteBuilderUrl'] );
		} finally {
			$this->deactivate_onboarding_planner_exit_experiment();
		}
	}

	public function test_get_site_builder_url_returns_empty_when_constant_undefined() {
		if ( defined( 'ELEMENTOR_SITE_BUILDER_URL' ) ) {
			$this->markTestSkipped( 'ELEMENTOR_SITE_BUILDER_URL is defined in this environment.' );
		}

		$module = new Module();
		$method = new ReflectionMethod( $module, 'get_site_builder_url' );
		$method->setAccessible( true );

		$this->assertSame( '', $method->invoke( $module ) );
	}

	public function test_onboarding_config_excludes_planner_exit_when_experiment_inactive() {
		$this->deactivate_onboarding_planner_exit_experiment();

		$_GET['page'] = 'elementor-app';
		do_action( 'elementor/init' );

		$settings = Plugin::$instance->app->get_settings( 'onboarding' );

		$this->assertFalse( $settings['shouldRedirectToSitePlanner'] );
	}

	private function activate_onboarding_planner_exit_experiment(): void {
		Plugin::$instance->experiments->set_feature_default_state( 'site-builder', Experiments_Manager::STATE_ACTIVE );
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ONBOARDING_PLANNER_EXIT_EXPERIMENT,
			Experiments_Manager::STATE_ACTIVE
		);
	}

	private function deactivate_onboarding_planner_exit_experiment(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ONBOARDING_PLANNER_EXIT_EXPERIMENT,
			Experiments_Manager::STATE_INACTIVE
		);
		Plugin::$instance->experiments->set_feature_default_state( 'site-builder', Experiments_Manager::STATE_INACTIVE );
	}
}
