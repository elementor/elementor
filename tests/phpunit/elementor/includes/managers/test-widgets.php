<?php

namespace Elementor\Testing\Includes\Managers;

use Elementor\Controls_Manager;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Elements_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widgets extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		// Force controls cache to reset.
		Plugin::$instance->controls_manager = new Controls_Manager();
	}

	public function test_ajax_get_widgets_default_value_translations__uses_specific_locale_if_passed() {
		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_get_widgets_default_value_translations( [ 'locale' => 'he_IL' ] );

		// Assert.
		$this->assertEquals( 'לחץ כאן', $response['button']['controls']['text']['default'] );
	}

	public function test_ajax_get_widgets_default_value_translations__returns_only_controls() {
		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_get_widgets_default_value_translations();

		// Assert.
		$this->assertCount( 1, $response['button'] );
		$this->assert_array_have_keys( [ 'controls' ], $response['button'] );
	}

	public function test_ajax_get_widgets_default_value_translations__returns_only_defaults() {
		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_get_widgets_default_value_translations();

		// Assert.
		$control = $response['button']['controls']['text'];

		$this->assertCount( 1, $control );
		$this->assert_array_have_keys( [ 'default' ], $control );
	}

	public function test_ajax_refresh_widgets_config__returns_widgets_and_categories() {
		// Arrange.
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		$post_id = $this->factory()->create_and_get_default_post()->ID;

		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_refresh_widgets_config( [
			'editor_post_id' => $post_id,
		] );

		// Assert.
		$this->assertArrayHasKey( 'widgets', $response );
		$this->assertArrayHasKey( 'categories', $response );
	}

	public function test_ajax_refresh_widgets_config__widgets_contain_full_config() {
		// Arrange.
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		$post_id = $this->factory()->create_and_get_default_post()->ID;

		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_refresh_widgets_config( [
			'editor_post_id' => $post_id,
		] );

		// Assert.
		$this->assertArrayHasKey( 'button', $response['widgets'] );

		$button_config = $response['widgets']['button'];

		$this->assertArrayHasKey( 'widget_type', $button_config );
		$this->assertArrayHasKey( 'title', $button_config );
		$this->assertArrayHasKey( 'icon', $button_config );
		$this->assertArrayHasKey( 'categories', $button_config );
		$this->assertArrayHasKey( 'keywords', $button_config );
	}

	public function test_ajax_refresh_widgets_config__categories_contain_basic() {
		// Arrange.
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		$post_id = $this->factory()->create_and_get_default_post()->ID;

		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_refresh_widgets_config( [
			'editor_post_id' => $post_id,
		] );

		// Assert.
		$this->assertArrayHasKey( 'basic', $response['categories'] );
		$this->assertArrayHasKey( 'title', $response['categories']['basic'] );
	}

	public function test_ajax_refresh_widgets_config__excludes_wordpress_category_when_experiment_active() {
		// Arrange.
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		$post_id = $this->factory()->create_and_get_default_post()->ID;

		Plugin::$instance->experiments->set_feature_default_state(
			Elements_Manager::EXPERIMENT_HIDE_WORDPRESS_WIDGETS,
			Experiments_Manager::STATE_ACTIVE
		);

		$elements_manager = Plugin::$instance->elements_manager;
		$prop = new \ReflectionProperty( $elements_manager, 'categories' );
		$prop->setAccessible( true );
		$prop->setValue( $elements_manager, null );

		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_refresh_widgets_config( [
			'editor_post_id' => $post_id,
		] );

		// Cleanup.
		Plugin::$instance->experiments->set_feature_default_state(
			Elements_Manager::EXPERIMENT_HIDE_WORDPRESS_WIDGETS,
			Experiments_Manager::STATE_ACTIVE
		);
		$prop->setValue( $elements_manager, null );

		// Assert.
		$this->assertArrayNotHasKey( Elements_Manager::CATEGORY_WORDPRESS, $response['categories'] );
	}

	public function test_ajax_refresh_widgets_config__wordpress_widgets_hide_from_panel_when_experiment_active() {
		// Arrange.
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		$post_id = $this->factory()->create_and_get_default_post()->ID;

		Plugin::$instance->experiments->set_feature_default_state(
			Elements_Manager::EXPERIMENT_HIDE_WORDPRESS_WIDGETS,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_refresh_widgets_config( [
			'editor_post_id' => $post_id,
		] );

		$wp_widget_config = $this->get_wordpress_widget_config_from_response( $response );

		if ( ! $wp_widget_config ) {
			$this->markTestSkipped( 'WordPress widget not available in widgets config' );
		}

		// Assert.
		$this->assertFalse( $wp_widget_config['show_in_panel'] );
		$this->assertTrue( $wp_widget_config['hide_on_search'] );
	}

	public function test_ajax_refresh_widgets_config__wordpress_widgets_show_in_panel_when_experiment_inactive() {
		// Arrange.
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		$post_id = $this->factory()->create_and_get_default_post()->ID;

		Plugin::$instance->experiments->set_feature_default_state(
			Elements_Manager::EXPERIMENT_HIDE_WORDPRESS_WIDGETS,
			Experiments_Manager::STATE_INACTIVE
		);

		$elements_manager = Plugin::$instance->elements_manager;
		$prop = new \ReflectionProperty( $elements_manager, 'categories' );
		$prop->setAccessible( true );
		$prop->setValue( $elements_manager, null );

		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_refresh_widgets_config( [
			'editor_post_id' => $post_id,
		] );

		$wp_widget_config = $this->get_wordpress_widget_config_from_response( $response );

		// Cleanup.
		Plugin::$instance->experiments->set_feature_default_state(
			Elements_Manager::EXPERIMENT_HIDE_WORDPRESS_WIDGETS,
			Experiments_Manager::STATE_ACTIVE
		);
		$prop->setValue( $elements_manager, null );

		if ( ! $wp_widget_config ) {
			$this->markTestSkipped( 'WordPress widget not available in widgets config' );
		}

		// Assert.
		$this->assertTrue( $wp_widget_config['show_in_panel'] );
		$this->assertFalse( $wp_widget_config['hide_on_search'] );
	}

	private function get_wordpress_widget_config_from_response( array $response ): ?array {
		foreach ( $response['widgets'] as $widget_key => $widget_config ) {
			if ( 0 === strpos( $widget_key, 'wp-widget-' ) ) {
				return $widget_config;
			}
		}

		return null;
	}

	public function test_ajax_get_widgets_default_value_translations__doesnt_return_empty_controls() {
		// Act.
		$response = Plugin::$instance->widgets_manager->ajax_get_widgets_default_value_translations();

		// Assert.
		// Button has translated defaults while inner-section doesn't.
		$this->assert_array_have_keys( [ 'button' ], $response );
		$this->assert_array_not_have_keys( [ 'inner-section' ], $response );
	}
}
