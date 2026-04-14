<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block_Twig;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox_Twig;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Twig_Containers extends Elementor_Test_Base {
	use MatchesSnapshots;

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
		$instance = $this->create_twig_element( Div_Block_Twig::class, 'e8e55a1' );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_twig_div_block_with_link(): void {
		// Arrange.
		$instance = $this->create_twig_element( Div_Block_Twig::class, 'e8e55a1', [
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
		$instance = $this->create_twig_element( Div_Block_Twig::class, 'e8e55a1', [
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
		$instance = $this->create_twig_element( Flexbox_Twig::class, 'e8e55a1' );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_twig_flexbox_with_link(): void {
		// Arrange.
		$instance = $this->create_twig_element( Flexbox_Twig::class, 'e8e55a1', [
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
		$instance = $this->create_twig_element( Flexbox_Twig::class, 'e8e55a1', [
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

	public function test__twig_div_block_output_matches_non_templated(): void {
		// Arrange.
		$non_templated_output = $this->render_element( Div_Block::class, 'e8e55a1' );
		$templated_output = $this->render_element( Div_Block_Twig::class, 'e8e55a1' );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $non_templated_output ),
			$this->normalize_html( $templated_output )
		);
	}

	public function test__twig_div_block_with_link_output_matches_non_templated(): void {
		// Arrange.
		$settings = [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_blank',
				'tag' => 'a',
			],
		];
		$non_templated_output = $this->render_element( Div_Block::class, 'e8e55a1', $settings );
		$templated_output = $this->render_element( Div_Block_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $non_templated_output ),
			$this->normalize_html( $templated_output )
		);
	}

	public function test__twig_div_block_with_action_link_output_matches_non_templated(): void {
		// Arrange.
		$settings = [
			'link' => [
				'href' => 'https://very.dynamic.content.elementor',
				'target' => '_blank',
				'tag' => 'button',
			],
		];
		$non_templated_output = $this->render_element( Div_Block::class, 'e8e55a1', $settings );
		$templated_output = $this->render_element( Div_Block_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $non_templated_output ),
			$this->normalize_html( $templated_output )
		);
	}

	public function test__twig_flexbox_output_matches_non_templated(): void {
		// Arrange.
		$non_templated_output = $this->render_element( Flexbox::class, 'e8e55a1' );
		$templated_output = $this->render_element( Flexbox_Twig::class, 'e8e55a1' );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $non_templated_output ),
			$this->normalize_html( $templated_output )
		);
	}

	public function test__twig_flexbox_with_link_output_matches_non_templated(): void {
		// Arrange.
		$settings = [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_blank',
				'tag' => 'a',
			],
		];
		$non_templated_output = $this->render_element( Flexbox::class, 'e8e55a1', $settings );
		$templated_output = $this->render_element( Flexbox_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $non_templated_output ),
			$this->normalize_html( $templated_output )
		);
	}

	public function test__twig_flexbox_with_action_link_output_matches_non_templated(): void {
		// Arrange.
		$settings = [
			'link' => [
				'href' => 'https://very.dynamic.content.elementor',
				'target' => '_blank',
				'tag' => 'button',
			],
		];
		$non_templated_output = $this->render_element( Flexbox::class, 'e8e55a1', $settings );
		$templated_output = $this->render_element( Flexbox_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $non_templated_output ),
			$this->normalize_html( $templated_output )
		);
	}

	private function create_twig_element( string $class, string $id, array $settings = [] ) {
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

	private function render_element( string $class, string $id, array $settings = [] ): string {
		$element = new $class( [
			'id' => $id,
			'elType' => $class::get_element_type(),
			'settings' => $settings,
		] );

		$element->add_child( $this->make_paragraph_child( $id ) );

		return $this->render( $element );
	}

	private function normalize_html( string $html ): string {
		$html = preg_replace( '/\s+/', ' ', $html );
		$html = preg_replace( '/>\s+</', '><', $html );
		$html = preg_replace( '/\s+>/', '>', $html );
		$html = preg_replace( '/\s+"/', '"', $html );

		return trim( $html );
	}
}
