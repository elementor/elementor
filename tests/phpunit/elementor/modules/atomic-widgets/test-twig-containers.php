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
		// Assert.
		$this->assertSame( 'e-div-block', Div_Block_Twig::get_type() );
		$this->assertSame( 'e-div-block', Div_Block_Twig::get_element_type() );
	}

	public function test__flexbox_twig_preserves_element_type(): void {
		// Assert.
		$this->assertSame( 'e-flexbox', Flexbox_Twig::get_type() );
		$this->assertSame( 'e-flexbox', Flexbox_Twig::get_element_type() );
	}

	public function test__render_twig_div_block(): void {
		// Arrange.
		$instance = $this->create_div_block_instance( 'e8e55a1' );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_twig_div_block_with_link(): void {
		// Arrange.
		$instance = $this->create_div_block_instance( 'e8e55a1', [
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
		$instance = $this->create_div_block_instance( 'e8e55a1', [
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
	}

	public function test__render_twig_flexbox(): void {
		// Arrange.
		$instance = $this->create_flexbox_instance( 'e8e55a1' );
		$instance->add_child( $this->make_paragraph_child( 'e8e55a1' ) );

		// Act.
		$rendered_output = $this->render( $instance );

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_twig_flexbox_with_link(): void {
		// Arrange.
		$instance = $this->create_flexbox_instance( 'e8e55a1', [
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
		$instance = $this->create_flexbox_instance( 'e8e55a1', [
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
	}

	public function test__twig_div_block_output_matches_php_div_block(): void {
		// Arrange.
		$settings = [];
		$php_output = $this->render_php_element( Div_Block::class, 'e8e55a1', $settings );
		$twig_output = $this->render_twig_element( Div_Block_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $php_output ),
			$this->normalize_html( $twig_output )
		);
	}

	public function test__twig_div_block_with_link_output_matches_php(): void {
		// Arrange.
		$settings = [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_blank',
				'tag' => 'a',
			],
		];
		$php_output = $this->render_php_element( Div_Block::class, 'e8e55a1', $settings );
		$twig_output = $this->render_twig_element( Div_Block_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $php_output ),
			$this->normalize_html( $twig_output )
		);
	}

	public function test__twig_div_block_with_action_link_output_matches_php(): void {
		// Arrange.
		$settings = [
			'link' => [
				'href' => 'https://very.dynamic.content.elementor',
				'target' => '_blank',
				'tag' => 'button',
			],
		];
		$php_output = $this->render_php_element( Div_Block::class, 'e8e55a1', $settings );
		$twig_output = $this->render_twig_element( Div_Block_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $php_output ),
			$this->normalize_html( $twig_output )
		);
	}

	public function test__twig_flexbox_output_matches_php_flexbox(): void {
		// Arrange.
		$settings = [];
		$php_output = $this->render_php_element( Flexbox::class, 'e8e55a1', $settings );
		$twig_output = $this->render_twig_element( Flexbox_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $php_output ),
			$this->normalize_html( $twig_output )
		);
	}

	public function test__twig_flexbox_with_link_output_matches_php(): void {
		// Arrange.
		$settings = [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_blank',
				'tag' => 'a',
			],
		];
		$php_output = $this->render_php_element( Flexbox::class, 'e8e55a1', $settings );
		$twig_output = $this->render_twig_element( Flexbox_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $php_output ),
			$this->normalize_html( $twig_output )
		);
	}

	public function test__twig_flexbox_with_action_link_output_matches_php(): void {
		// Arrange.
		$settings = [
			'link' => [
				'href' => 'https://very.dynamic.content.elementor',
				'target' => '_blank',
				'tag' => 'button',
			],
		];
		$php_output = $this->render_php_element( Flexbox::class, 'e8e55a1', $settings );
		$twig_output = $this->render_twig_element( Flexbox_Twig::class, 'e8e55a1', $settings );

		// Assert.
		$this->assertSame(
			$this->normalize_html( $php_output ),
			$this->normalize_html( $twig_output )
		);
	}

	public function test__div_block_twig_inherits_base_styles(): void {
		// Arrange.
		$twig_config = ( new Div_Block_Twig() )->get_initial_config();
		$base_config = ( new Div_Block() )->get_initial_config();

		// Assert.
		$this->assertSame( $base_config['base_styles'], $twig_config['base_styles'] );
		$this->assertSame( $base_config['atomic_props_schema'], $twig_config['atomic_props_schema'] );
	}

	public function test__flexbox_twig_inherits_base_styles(): void {
		// Arrange.
		$twig_config = ( new Flexbox_Twig() )->get_initial_config();
		$base_config = ( new Flexbox() )->get_initial_config();

		// Assert.
		$this->assertSame( $base_config['base_styles'], $twig_config['base_styles'] );
		$this->assertSame( $base_config['atomic_props_schema'], $twig_config['atomic_props_schema'] );
	}

	private function create_div_block_instance( string $id, array $settings = [] ) {
		$mock = [
			'id' => $id,
			'elType' => Div_Block_Twig::get_element_type(),
			'settings' => $settings,
			'widgetType' => Div_Block_Twig::get_element_type(),
		];

		return Plugin::$instance->elements_manager->create_element_instance( $mock );
	}

	private function create_flexbox_instance( string $id, array $settings = [] ) {
		$mock = [
			'id' => $id,
			'elType' => Flexbox_Twig::get_element_type(),
			'settings' => $settings,
			'widgetType' => Flexbox_Twig::get_element_type(),
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

	private function render_php_element( string $class, string $id, array $settings ): string {
		$element = new $class( [
			'id' => $id,
			'elType' => $class::get_element_type(),
			'settings' => $settings,
		] );

		$element->add_child( $this->make_paragraph_child( $id ) );

		return $this->render( $element );
	}

	private function render_twig_element( string $class, string $id, array $settings ): string {
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

		return trim( $html );
	}
}
