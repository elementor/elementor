<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block_Twig;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox_Twig;
use Elementor\Modules\AtomicWidgets\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Twig_Containers extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_TWIG_CONTAINERS,
			\Elementor\Core\Experiments\Manager::STATE_ACTIVE
		);
	}

	public function tearDown(): void {
		parent::tearDown();

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_TWIG_CONTAINERS,
			\Elementor\Core\Experiments\Manager::STATE_INACTIVE
		);
	}

	public function test__div_block_twig_has_support_nesting_in_config(): void {
		// Arrange.
		$instance = new Div_Block_Twig();

		// Act.
		$config = $instance->get_initial_config();

		// Assert.
		$this->assertTrue( $config['support_nesting'] );
		$this->assertNotEmpty( $config['twig_main_template'] );
		$this->assertNotEmpty( $config['twig_templates'] );
		$this->assertNotEmpty( $config['base_styles_dictionary'] );
	}

	public function test__flexbox_twig_has_support_nesting_in_config(): void {
		// Arrange.
		$instance = new Flexbox_Twig();

		// Act.
		$config = $instance->get_initial_config();

		// Assert.
		$this->assertTrue( $config['support_nesting'] );
		$this->assertNotEmpty( $config['twig_main_template'] );
		$this->assertNotEmpty( $config['twig_templates'] );
		$this->assertNotEmpty( $config['base_styles_dictionary'] );
	}

	public function test__div_block_twig_preserves_element_type(): void {
		// Arrange.
		$instance = new Div_Block_Twig();

		// Act & Assert.
		$this->assertSame( 'e-div-block', $instance::get_type() );
		$this->assertSame( 'e-div-block', $instance::get_element_type() );
	}

	public function test__flexbox_twig_preserves_element_type(): void {
		// Arrange.
		$instance = new Flexbox_Twig();

		// Act & Assert.
		$this->assertSame( 'e-flexbox', $instance::get_type() );
		$this->assertSame( 'e-flexbox', $instance::get_element_type() );
	}

	public function test__div_block_twig_renders_with_children(): void {
		// Arrange.
		$mock = [
			'id' => 'div-twig-1',
			'elType' => Div_Block_Twig::get_element_type(),
			'settings' => [],
			'widgetType' => Div_Block_Twig::get_element_type(),
		];

		$mock_child = [
			'id' => 'child-1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$instance = Plugin::$instance->elements_manager->create_element_instance( $mock );
		$instance->add_child( $mock_child );

		// Act.
		ob_start();
		$instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( 'data-id="div-twig-1"', $rendered_output );
		$this->assertStringContainsString( 'data-element_type="e-div-block"', $rendered_output );
		$this->assertStringContainsString( 'e-con', $rendered_output );
		$this->assertStringContainsString( 'e-atomic-element', $rendered_output );
		$this->assertStringContainsString( '<div', $rendered_output );
		$this->assertStringNotContainsString( '<!-- elementor-children-placeholder -->', $rendered_output );
	}

	public function test__div_block_twig_renders_with_link(): void {
		// Arrange.
		$mock = [
			'id' => 'div-link-1',
			'elType' => Div_Block_Twig::get_element_type(),
			'settings' => [
				'link' => [
					'href' => 'https://example.com',
					'target' => '_blank',
					'tag' => 'a',
				],
			],
			'widgetType' => Div_Block_Twig::get_element_type(),
		];

		$instance = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Act.
		ob_start();
		$instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( '<a', $rendered_output );
		$this->assertStringContainsString( 'href="https://example.com"', $rendered_output );
		$this->assertStringContainsString( 'target="_blank"', $rendered_output );
	}

	public function test__div_block_twig_renders_with_action_link(): void {
		// Arrange.
		$mock = [
			'id' => 'div-action-1',
			'elType' => Div_Block_Twig::get_element_type(),
			'settings' => [
				'link' => [
					'href' => 'https://example.com/action',
					'target' => '_blank',
					'tag' => 'button',
				],
			],
			'widgetType' => Div_Block_Twig::get_element_type(),
		];

		$instance = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Act.
		ob_start();
		$instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( '<button', $rendered_output );
		$this->assertStringContainsString( 'data-action-link="https://example.com/action"', $rendered_output );
		$this->assertStringNotContainsString( 'href="', $rendered_output );
	}

	public function test__flexbox_twig_renders_with_children(): void {
		// Arrange.
		$mock = [
			'id' => 'flex-twig-1',
			'elType' => Flexbox_Twig::get_element_type(),
			'settings' => [],
			'widgetType' => Flexbox_Twig::get_element_type(),
		];

		$mock_child = [
			'id' => 'child-1',
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];

		$instance = Plugin::$instance->elements_manager->create_element_instance( $mock );
		$instance->add_child( $mock_child );

		// Act.
		ob_start();
		$instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( 'data-id="flex-twig-1"', $rendered_output );
		$this->assertStringContainsString( 'data-element_type="e-flexbox"', $rendered_output );
		$this->assertStringContainsString( 'e-con', $rendered_output );
		$this->assertStringContainsString( 'e-atomic-element', $rendered_output );
		$this->assertStringContainsString( '<div', $rendered_output );
		$this->assertStringNotContainsString( '<!-- elementor-children-placeholder -->', $rendered_output );
	}

	public function test__div_block_twig_inherits_base_styles(): void {
		// Arrange.
		$twig_instance = new Div_Block_Twig();
		$base_instance = new Div_Block();

		// Act.
		$twig_config = $twig_instance->get_initial_config();
		$base_config = $base_instance->get_initial_config();

		// Assert.
		$this->assertSame( $base_config['base_styles'], $twig_config['base_styles'] );
		$this->assertSame( $base_config['atomic_props_schema'], $twig_config['atomic_props_schema'] );
	}

	public function test__flexbox_twig_inherits_base_styles(): void {
		// Arrange.
		$twig_instance = new Flexbox_Twig();
		$base_instance = new Flexbox();

		// Act.
		$twig_config = $twig_instance->get_initial_config();
		$base_config = $base_instance->get_initial_config();

		// Assert.
		$this->assertSame( $base_config['base_styles'], $twig_config['base_styles'] );
		$this->assertSame( $base_config['atomic_props_schema'], $twig_config['atomic_props_schema'] );
	}
}
