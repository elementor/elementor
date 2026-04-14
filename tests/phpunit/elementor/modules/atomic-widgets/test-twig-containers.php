<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block_Twig;
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

	public function test__div_block_twig_preserves_element_type(): void {
		$this->assertSame( 'e-div-block', Div_Block_Twig::get_type() );
		$this->assertSame( 'e-div-block', Div_Block_Twig::get_element_type() );
	}

	public function test__flexbox_twig_preserves_element_type(): void {
		$this->assertSame( 'e-flexbox', Flexbox_Twig::get_type() );
		$this->assertSame( 'e-flexbox', Flexbox_Twig::get_element_type() );
	}

	public function test__render_twig_div_block(): void {
		// Arrange.
		$instance = $this->create_element_instance( Div_Block_Twig::get_element_type(), 'e8e55a1' );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_twig_div_block_with_link(): void {
		// Arrange.
		$instance = $this->create_element_instance( Div_Block_Twig::get_element_type(), 'e8e55a1', [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_blank',
				'tag' => 'a',
			],
		] );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_twig_div_block_with_action_link(): void {
		// Arrange.
		$instance = $this->create_element_instance( Div_Block_Twig::get_element_type(), 'e8e55a1', [
			'link' => [
				'href' => 'https://very.dynamic.content.elementor',
				'target' => '_blank',
				'tag' => 'button',
			],
		] );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
		$this->assertStringContainsString( 'data-action-link=', $rendered_output );
		$this->assertStringContainsString( '<button', $rendered_output );
		$this->assertStringNotContainsString( '<a', $rendered_output );
		$this->assertStringNotContainsString( 'href="', $rendered_output );
	}

	public function test__render_twig_flexbox(): void {
		// Arrange.
		$instance = $this->create_element_instance( Flexbox_Twig::get_element_type(), 'e8e55a1' );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_twig_flexbox_with_link(): void {
		// Arrange.
		$instance = $this->create_element_instance( Flexbox_Twig::get_element_type(), 'e8e55a1', [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_blank',
				'tag' => 'a',
			],
		] );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_twig_flexbox_with_action_link(): void {
		// Arrange.
		$instance = $this->create_element_instance( Flexbox_Twig::get_element_type(), 'e8e55a1', [
			'link' => [
				'href' => 'https://very.dynamic.content.elementor',
				'target' => '_blank',
				'tag' => 'button',
			],
		] );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
		$this->assertStringContainsString( 'data-action-link=', $rendered_output );
		$this->assertStringContainsString( '<button', $rendered_output );
		$this->assertStringNotContainsString( '<a', $rendered_output );
		$this->assertStringNotContainsString( 'href="', $rendered_output );
	}

	private function create_element_instance( string $element_type, string $id, array $settings = [] ) {
		$mock = [
			'id' => $id,
			'elType' => $element_type,
			'settings' => $settings,
			'widgetType' => $element_type,
		];

		return Plugin::$instance->elements_manager->create_element_instance( $mock );
	}

	private function make_paragraph_child( string $id ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'settings' => [],
			'widgetType' => Atomic_Paragraph::get_element_type(),
		];
	}

	private function render( $instance ): string {
		ob_start();
		$instance->print_element();
		return ob_get_clean();
	}
}
