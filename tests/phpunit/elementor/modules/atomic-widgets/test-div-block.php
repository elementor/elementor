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

}
