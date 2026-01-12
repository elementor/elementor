<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Div_Block extends Elementor_Test_Base {
	use MatchesSnapshots;

	protected $instance;

	public function setUp(): void {
		parent::setUp();

		$mock =[
			'id' => 'e8e55a1',
			'elType' => Div_Block::get_element_type(),
			'settings' => [],
			'widgetType' => Div_Block::get_element_type(),
		];

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( $mock );
	}

	public function test__render_div_block(): void {
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

	public function test__render_div_block_with_link_control(): void {
		// Arrange.
		$mock_child =  [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$mock_link = [
			'id' => 'e8e55a1',
			'elType' => Div_Block::get_element_type(),
			'settings' => [
				'link' => [
					'href' => 'https://example.com',
					'target' => '_blank',
					'tag' => 'a',
				],
			],
			'widgetType' => Div_Block::get_element_type(),
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

	public function test__render_div_block_with_interactions(): void {
		// Arrange.
		$mock_with_interactions = [
			'id' => 'e8e55a1',
			'elType' => Div_Block::get_element_type(),
			'settings' => [],
			'widgetType' => Div_Block::get_element_type(),
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
		$mock_child = [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_with_interactions );
		$widget_instance->add_child( $mock_child );

		// Act.
		ob_start();
		$widget_instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__add_child_with_non_existent_widget_type(): void {
		// Arrange.
		$non_existent_widget_data = [
			'id' => 'test-child',
			'elType' => 'widget',
			'widgetType' => 'non_existent_widget_type',
		];

		// Act.
		$result = $this->instance->add_child( $non_existent_widget_data );

		// Assert.
		$this->assertFalse( $result );
		$this->assertEmpty( $this->instance->get_children() );
	}

	public function test__render_div_block_with_action_link(): void {
		// Arrange.
		$mock_child =  [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$mock_link = [
			'id' => 'e8e55a1',
			'elType' => Div_Block::get_element_type(),
			'settings' => [
				'link' => [
					'href' => 'https://very.dynamic.content.elementor',
					'target' => '_blank',
					'tag' => 'button',
				],
			],
			'widgetType' => Div_Block::get_element_type(),
		];


		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $mock_link );
		$widget_instance->add_child( $mock_child );

		// Act.
		ob_start();
		$widget_instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
		$this->assertStringContainsString( 'data-action-link="https://very.dynamic.content.elementor"', $rendered_output );
		$this->assertStringContainsString( '<button', $rendered_output );
		$this->assertStringNotContainsString( '<a', $rendered_output );
		$this->assertStringNotContainsString( 'href="', $rendered_output );
	}
}
