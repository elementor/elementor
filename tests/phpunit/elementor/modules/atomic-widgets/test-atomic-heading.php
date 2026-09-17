<?php

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Plugin;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Heading extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function test__render_heading(): void {
		// Arrange.
		$mock = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Heading::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_linked_heading(): void {
		// Arrange.
		$mock_link = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'link' => [
					'href' => 'https://example.com',
					'target' => '_blank',
					'tag' => 'a',
				],
			],
			'widgetType' => Atomic_Heading::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_linked_heading_target_self(): void {
		// Arrange.
		$mock_link_target_self = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'link' => [
					'href' => 'https://example.com',
					'target' => '_self',
					'tag' => 'a',
				],
			],
			'widgetType' => Atomic_Heading::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link_target_self );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_heading_with_action_link(): void {
		// Arrange.
		$mock_link = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'link' => [
					'href' => 'https://very.dynamic.content.elementor',
					'target' => '_blank',
					'tag' => 'button',
				],
			],
			'widgetType' => Atomic_Heading::get_element_type(),
		];

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
		$this->assertStringContainsString( 'data-action-link="https://very.dynamic.content.elementor"', $rendered_output );
		$this->assertStringContainsString( '<button', $rendered_output );
		$this->assertStringNotContainsString( '<a', $rendered_output );
		$this->assertStringNotContainsString( 'href="', $rendered_output );
	}

	public function test__render_heading_with_cssid_should_emit_unescaped_id_attribute(): void {
		// Arrange.
		$mock = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [
				'_cssid' => 'my-custom-id',
			],
			'widgetType' => Atomic_Heading::get_element_type(),
		];
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( 'id="my-custom-id"', $rendered_output );
		$this->assertStringNotContainsString( 'id=&quot;', $rendered_output );
	}

	public function test__ally_promotion_notice_is_included_for_admin_by_default(): void {
		// Arrange.
		$this->act_as_admin();

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Heading::get_element_type(),
		] );

		// Act.
		$notice_control = $this->find_ally_notice_control( $widget_instance );

		// Assert.
		$this->assertNotNull( $notice_control );
		$this->assertSame( '_ally_notice', $notice_control->get_bind() );
		$this->assertSame( 'ally_atomic_notice', $notice_control->get_props()['dismissible'] );

		$button_url = $notice_control->get_props()['buttonUrl'];
		$this->assertStringNotContainsString( '&amp;', $button_url );
		$this->assertStringContainsString( '&', $button_url );
	}

	public function test__ally_promotion_notice_is_hidden_when_already_dismissed(): void {
		// Arrange.
		$this->act_as_admin();
		update_user_meta( get_current_user_id(), User::DISMISSED_EDITOR_NOTICES_KEY, [ 'ally_atomic_notice' ] );

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Heading::get_element_type(),
		] );

		// Act.
		$notice_control = $this->find_ally_notice_control( $widget_instance );

		// Assert.
		$this->assertNull( $notice_control );
	}

	public function test__ally_promotion_notice_is_hidden_when_ally_is_connected(): void {
		// Arrange.
		$this->act_as_admin();
		update_option( 'ea11y_access_token', 'test-token' );

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Heading::get_element_type(),
		] );

		// Act.
		$notice_control = $this->find_ally_notice_control( $widget_instance );

		// Assert.
		$this->assertNull( $notice_control );

		// Cleanup.
		delete_option( 'ea11y_access_token' );
	}

	public function test__ally_promotion_notice_is_hidden_without_install_plugins_capability(): void {
		// Arrange.
		$this->act_as_subscriber();

		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Heading::get_element_type(),
		] );

		// Act.
		$notice_control = $this->find_ally_notice_control( $widget_instance );

		// Assert.
		$this->assertNull( $notice_control );
	}

	private function find_ally_notice_control( $widget_instance ) {
		foreach ( $widget_instance->get_atomic_controls() as $control ) {
			if ( ! ( $control instanceof Section ) || 'content' !== $control->get_id() ) {
				continue;
			}

			foreach ( $control->get_items() as $item ) {
				if ( method_exists( $item, 'get_bind' ) && '_ally_notice' === $item->get_bind() ) {
					return $item;
				}
			}
		}

		return null;
	}
}
