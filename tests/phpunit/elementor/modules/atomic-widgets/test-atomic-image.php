<?php

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Plugin;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Atomic_Image extends Elementor_Test_Base {
	public function test__io_promotion_notice_is_included_for_admin_by_default(): void {
		// Arrange.
		$this->act_as_admin_or_network_admin();

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Image::get_element_type(),
		] );

		// Act.
		$image_control = $this->find_image_control( $widget_instance );

		// Assert.
		$this->assertNotNull( $image_control );
		$promotion = $image_control->get_props()['promotion'] ?? null;
		$this->assertIsArray( $promotion );
		$this->assertSame( 'image_optimizer_hint', $promotion['dismissible'] );
		$this->assertSame( 'Optimize', $promotion['label'] );
		$this->assertSame( 'Optimize your images', $promotion['title'] );
		$this->assertSame( 'Improve site performance by optimizing your images with Image Optimizer.', $promotion['content'] );

		$button_url = $promotion['buttonUrl'];
		$this->assertStringNotContainsString( '&amp;', $button_url );
		$this->assertStringContainsString( '&', $button_url );
	}

	public function test__io_promotion_notice_is_hidden_when_already_dismissed(): void {
		// Arrange.
		$this->act_as_admin();
		update_user_meta( get_current_user_id(), User::DISMISSED_EDITOR_NOTICES_KEY, [ 'image_optimizer_hint' ] );

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Image::get_element_type(),
		] );

		// Act.
		$image_control = $this->find_image_control( $widget_instance );

		// Assert.
		$this->assertNotNull( $image_control );
		$this->assertArrayNotHasKey( 'promotion', $image_control->get_props() );
	}

	public function test__io_promotion_notice_is_hidden_without_install_plugins_capability(): void {
		// Arrange.
		$this->act_as_subscriber();

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Image::get_element_type(),
		] );

		// Act.
		$image_control = $this->find_image_control( $widget_instance );

		// Assert.
		$this->assertNotNull( $image_control );
		$this->assertArrayNotHasKey( 'promotion', $image_control->get_props() );
	}

	public function test__io_promotion_notice_is_hidden_when_plugin_is_active(): void {
		// Arrange.
		$this->act_as_admin();
		$force_image_optimization_active = static function () {
			return [ 'image-optimization/image-optimization.php' ];
		};
		add_filter( 'pre_option_active_plugins', $force_image_optimization_active );

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Image::get_element_type(),
		] );

		// Act.
		$image_control = $this->find_image_control( $widget_instance );

		// Assert.
		$this->assertNotNull( $image_control );
		$this->assertArrayNotHasKey( 'promotion', $image_control->get_props() );

		// Cleanup.
		remove_filter( 'pre_option_active_plugins', $force_image_optimization_active );
	}

	public function test__io_promotion_notice_shows_one_install_copy_when_one_subscription_and_not_installed(): void {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		update_option( 'elementor_one_access_token', 'test-token' );

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Image::get_element_type(),
		] );

		// Act.
		$image_control = $this->find_image_control( $widget_instance );

		// Assert.
		$this->assertNotNull( $image_control );
		$promotion = $image_control->get_props()['promotion'] ?? null;
		$this->assertIsArray( $promotion );
		$this->assertSame( 'Install now', $promotion['buttonText'] );
		$this->assertSame( 'Improve site performance by optimizing your images with Image Optimizer.', $promotion['content'] );
		$this->assertStringContainsString( 'plg_campaign=io-plg-atoms-one-install', $promotion['buttonUrl'] );

		// Cleanup.
		delete_option( 'elementor_one_access_token' );
	}

	public function test__io_promotion_notice_shows_one_activate_copy_when_one_subscription_and_installed(): void {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		update_option( 'elementor_one_access_token', 'test-token' );
		wp_cache_set( 'plugins', [ '' => [ 'image-optimization/image-optimization.php' => [ 'Name' => 'Image Optimization' ] ] ], 'plugins' );

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Image::get_element_type(),
		] );

		// Act.
		$image_control = $this->find_image_control( $widget_instance );

		// Assert.
		$this->assertNotNull( $image_control );
		$promotion = $image_control->get_props()['promotion'] ?? null;
		$this->assertIsArray( $promotion );
		$this->assertSame( 'Activate now', $promotion['buttonText'] );
		$this->assertSame( 'Improve site performance by optimizing your images with Image Optimizer.', $promotion['content'] );
		$this->assertStringContainsString( 'plg_campaign=io-plg-atoms-one-activate', $promotion['buttonUrl'] );

		// Cleanup.
		delete_option( 'elementor_one_access_token' );
		wp_cache_delete( 'plugins', 'plugins' );
	}

	private function find_image_control( $widget_instance ) {
		foreach ( $widget_instance->get_atomic_controls() as $control ) {
			if ( ! ( $control instanceof Section ) || 'content' !== $control->get_id() ) {
				continue;
			}

			foreach ( $control->get_items() as $item ) {
				if ( method_exists( $item, 'get_bind' ) && 'image' === $item->get_bind() ) {
					return $item;
				}
			}
		}

		return null;
	}
}
