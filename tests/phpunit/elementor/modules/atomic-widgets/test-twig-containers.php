<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Twig_Containers extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function test__div_block_preserves_element_type(): void {
		$this->assertSame( 'e-div-block', Div_Block::get_type() );
		$this->assertSame( 'e-div-block', Div_Block::get_element_type() );
	}

	public function test__flexbox_preserves_element_type(): void {
		$this->assertSame( 'e-flexbox', Flexbox::get_type() );
		$this->assertSame( 'e-flexbox', Flexbox::get_element_type() );
	}

	public function test__render_div_block(): void {
		// Arrange.
		$instance = $this->create_element( Div_Block::class, 'e8e55a1' );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_div_block_with_link(): void {
		// Arrange.
		$instance = $this->create_element( Div_Block::class, 'e8e55a1', [
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

	public function test__render_div_block_with_action_link(): void {
		// Arrange.
		$instance = $this->create_element( Div_Block::class, 'e8e55a1', [
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

	public function test__render_flexbox(): void {
		// Arrange.
		$instance = $this->create_element( Flexbox::class, 'e8e55a1' );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_flexbox_with_link(): void {
		// Arrange.
		$instance = $this->create_element( Flexbox::class, 'e8e55a1', [
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

	public function test__render_flexbox_with_action_link(): void {
		// Arrange.
		$instance = $this->create_element( Flexbox::class, 'e8e55a1', [
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

	private function create_element( string $class, string $id, array $settings = [] ) {
		return new $class( [
			'id' => $id,
			'elType' => $class::get_element_type(),
			'settings' => $settings,
		] );
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

	private function normalize_html( string $html ): string {
		$html = preg_replace( '/\s+/', ' ', $html );
		$html = preg_replace( '/>\s+</', '><', $html );
		$html = preg_replace( '/\s+>/', '>', $html );
		$html = preg_replace( '/\s+"/', '"', $html );

		return trim( $html );
	}
}
