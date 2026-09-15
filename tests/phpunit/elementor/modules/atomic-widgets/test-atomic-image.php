<?php

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Plugin;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Atomic_Image extends Elementor_Test_Base {
	public function test__io_promotion_notice_is_included_for_admin_by_default(): void {
		// Arrange.
		$this->act_as_admin();

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Image::get_element_type(),
		] );

		// Act.
		$notice_control = $this->find_io_notice_control( $widget_instance );

		// Assert.
		$this->assertNotNull( $notice_control );
		$this->assertSame( '_io_notice', $notice_control->get_bind() );
		$this->assertSame( 'image_optimizer_hint', $notice_control->get_props()['dismissible'] );

		$button_url = $notice_control->get_props()['buttonUrl'];
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
		$notice_control = $this->find_io_notice_control( $widget_instance );

		// Assert.
		$this->assertNull( $notice_control );
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
		$notice_control = $this->find_io_notice_control( $widget_instance );

		// Assert.
		$this->assertNull( $notice_control );
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
		$notice_control = $this->find_io_notice_control( $widget_instance );

		// Assert.
		$this->assertNull( $notice_control );

		// Cleanup.
		remove_filter( 'pre_option_active_plugins', $force_image_optimization_active );
	}

	public function test__io_promotion_notice_shows_one_install_copy_when_one_subscription_and_not_installed(): void {
		// Arrange.
		$this->act_as_admin();
		update_option( 'elementor_one_access_token', 'test-token' );

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Image::get_element_type(),
		] );

		// Act.
		$notice_control = $this->find_io_notice_control( $widget_instance );

		// Assert.
		$this->assertNotNull( $notice_control );
		$this->assertSame( 'Install now', $notice_control->get_props()['buttonText'] );
		$this->assertStringContainsString( 'plg_campaign=io-plg-atoms-one-install', $notice_control->get_props()['buttonUrl'] );

		// Cleanup.
		delete_option( 'elementor_one_access_token' );
	}

	private function find_io_notice_control( $widget_instance ) {
		foreach ( $widget_instance->get_atomic_controls() as $control ) {
			if ( ! ( $control instanceof Section ) || 'content' !== $control->get_id() ) {
				continue;
			}

			foreach ( $control->get_items() as $item ) {
				if ( method_exists( $item, 'get_bind' ) && '_io_notice' === $item->get_bind() ) {
					return $item;
				}
			}
		}

		return null;
	}
}
