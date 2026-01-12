<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Flexbox extends Elementor_Test_Base {
	use MatchesSnapshots;

	protected $instance;

	public function setUp(): void {
		parent::setUp();

		$mock =[
			'id' => 'e8e55a1',
			'elType' => Flexbox::get_element_type(),
			'settings' => [],
			'widgetType' => Flexbox::get_element_type(),
		];

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $mock );
	}

	public function test__render_flexbox(): void {
		// Arrange.
		$mock_child =  [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$this->instance->add_child( $mock_child );

		// Act.
		ob_start();
		$this->instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_flexbox_with_link_control(): void {
		// Arrange.
		$mock_child =  [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$mock_link = [
			'id' => 'e8e55a1',
			'elType' => Flexbox::get_element_type(),
			'settings' => [
				'link' => [
					'href' => 'https://example.com',
					'target' => '_blank',
					'tag' => 'a',
				],
			],
			'widgetType' => Flexbox::get_element_type(),
		];


		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link );
		$widget_instance->add_child( $mock_child );

		// Act.
		ob_start();
		$widget_instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_with_child_flexbox(): void {
		// Arrange.
		$mock_child_flexbox =  [
			'id' => 'a3v23u9',
			'elType' => Flexbox::get_element_type(),
			'settings' => [],
			'widgetType' => Flexbox::get_element_type(),
		];

		$mock_flexbox = [
			'id' => 'e8e55a1',
			'elType' => Flexbox::get_element_type(),
			'settings' => [],
			'widgetType' => Flexbox::get_element_type(),
		];

		$flexbox_element = Plugin::$instance->elements_manager->create_element_instance( $mock_flexbox );
		$flexbox_element->add_child( $mock_child_flexbox );

		// Act
		ob_start();
		$flexbox_element->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_with_css_id(): void {
		// Arrange.
		$mock_flexbox = [
			'id' => 'e8e55a1',
			'elType' => Flexbox::get_element_type(),
			'settings' => [
				'_cssid' => 'test-css-id',
			],
			'widgetType' => Flexbox::get_element_type(),
		];

		$flexbox_element = Plugin::$instance->elements_manager->create_element_instance( $mock_flexbox );

		// Act.
		ob_start();
		$flexbox_element->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_flexbox_with_interactions(): void {
		// Arrange.
		$mock_flexbox = [
			'id' => 'e8e55a1',
			'elType' => Flexbox::get_element_type(),
			'settings' => [],
			'widgetType' => Flexbox::get_element_type(),
			'interactions' => [
				'version' => 1,
				'items' => [
					[
						'animation' => [
							'animation_type' => 'full-preset',
							'animation_id' => 'load-fade-in--300-0',
						],
					],
				],
			],
		];
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_flexbox );

		// Act.
		ob_start();
		$widget_instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__add_child_with_non_existent_element_type(): void {
		// Arrange.
		$non_existent_child_data = [
			'id' => 'test-child',
			'elType' => 'unregistered_element_type',
		];

		// Act.
		$result = $this->instance->add_child( $non_existent_child_data );

		// Assert.
		$this->assertFalse( $result );
		$this->assertEmpty( $this->instance->get_children() );
	}

	public function test__render_flexbox_with_action_link(): void {
		// Arrange.
		$mock_child_flexbox =  [
			'id' => 'a3v23u9',
			'elType' => Flexbox::get_element_type(),
			'settings' => [],
			'widgetType' => Flexbox::get_element_type(),
		];

		$mock_flexbox = [
			'id' => 'e8e55a1',
			'elType' => Flexbox::get_element_type(),
			'settings' => [
				'link' => [
					'href' => 'https://very.dynamic.content.elementor',
					'target' => '_blank',
					'tag' => 'button',
				],
			],
			'widgetType' => Flexbox::get_element_type(),
		];

		$flexbox_element = Plugin::$instance->elements_manager->create_element_instance( $mock_flexbox );
		$flexbox_element->add_child( $mock_child_flexbox );

		// Act
		ob_start();
		$flexbox_element->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
		$this->assertStringContainsString( 'data-action-link="https://very.dynamic.content.elementor"', $rendered_output );
		$this->assertStringContainsString( '<button', $rendered_output );
		$this->assertStringNotContainsString( '<a', $rendered_output );
		$this->assertStringNotContainsString( 'href="', $rendered_output );
	}
}
