<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Background_Video extends Elementor_Test_Base {

	private function get_define_props_schema(): array {
		$reflection = new \ReflectionMethod( Atomic_Background_Video::class, 'define_props_schema' );
		$reflection->setAccessible( true );

		return $reflection->invoke( null );
	}

	public function test_state_prop_defaults_to_playing() {
		$schema = $this->get_define_props_schema();

		$this->assertSame( 'playing', $schema['state']->get_default()['value'] );
		$this->assertSame( [ 'playing', 'paused' ], $schema['state']->get_enum() );
	}

	public function test_empty_state_value_is_valid() {
		$schema = $this->get_define_props_schema();

		$this->assertTrue( $schema['state']->validate( [
			'$$type' => 'string',
			'value' => '',
		] ) );
	}

	public function test_null_state_value_is_valid() {
		$schema = $this->get_define_props_schema();

		$this->assertTrue( $schema['state']->validate( null ) );
	}

	public function test_tag_prop_supports_semantic_tags() {
		$schema = $this->get_define_props_schema();

		$this->assertSame( 'div', $schema['tag']->get_default()['value'] );
		$this->assertSame(
			[ 'div', 'header', 'section', 'article', 'aside', 'footer', 'main', 'nav' ],
			$schema['tag']->get_enum()
		);
	}

	public function tag_provider(): array {
		return [
			'div' => [ 'div' ],
			'header' => [ 'header' ],
			'section' => [ 'section' ],
			'article' => [ 'article' ],
			'aside' => [ 'aside' ],
			'footer' => [ 'footer' ],
			'main' => [ 'main' ],
			'nav' => [ 'nav' ],
		];
	}

	/**
	 * @dataProvider tag_provider
	 */
	public function test_render__uses_selected_html_tag( string $tag ) {
		$html = $this->render_background_video( [
			'tag' => String_Prop_Type::generate( $tag ),
		] );

		$this->assertMatchesRegularExpression( '/^\s*<' . $tag . '\s/', $html );
		$this->assertMatchesRegularExpression( '/<\/' . $tag . '>\s*$/', $html );
		$this->assertStringContainsString( 'e-default-' . $tag, $html );
		$this->assertStringContainsString( 'e-background-video', $html );
		$this->assertStringContainsString( 'data-e-type="e-background-video"', $html );
		$this->assertStringContainsString( 'x-data="eBackgroundVideo', $html );

		if ( 'div' !== $tag ) {
			$this->assertStringNotContainsString( 'e-default-div', $html );
		}
	}

	public function test_render__defaults_to_div_when_tag_is_not_set() {
		$html = $this->render_background_video( [] );

		$this->assertMatchesRegularExpression( '/^\s*<div\s/', $html );
		$this->assertMatchesRegularExpression( '/<\/div>\s*$/', $html );
		$this->assertStringContainsString( 'e-default-div', $html );
	}

	public function test_render__ignores_tag_outside_of_enum() {
		$html = $this->render_background_video( [
			'tag' => String_Prop_Type::generate( 'script' ),
		] );

		$this->assertStringNotContainsString( '<script', $html );
		$this->assertMatchesRegularExpression( '/^\s*<div\s/', $html );
	}

	private function render_background_video( array $settings ): string {
		$instance = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'bgvideo1',
			'elType' => Atomic_Background_Video::get_element_type(),
			'settings' => $settings,
			'elements' => [],
		] );

		$this->assertNotNull( $instance, 'Failed to create background video element instance.' );

		ob_start();
		$instance->print_element();

		return ob_get_clean();
	}
}
