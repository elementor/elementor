<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Dynamic_Styles_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Dynamic_Styles_Manager extends Elementor_Test_Base {

	public function tearDown(): void {
		Dynamic_Styles_Manager::reset();
		parent::tearDown();
	}

	public function test_register_and_get_definitions(): void {
		$dynamic_node = [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'post-title',
				'group' => 'post',
				'settings' => [],
			],
		];

		$manager = Dynamic_Styles_Manager::instance();
		$manager->register( '--e-dyn-demo-v0-color', $dynamic_node, [ 'class_id' => 'demo' ] );

		$definitions = $manager->get_definitions();

		$this->assertCount( 1, $definitions );
		$this->assertArrayHasKey( '--e-dyn-demo-v0-color', $definitions );
		$this->assertSame( '--e-dyn-demo-v0-color', $definitions['--e-dyn-demo-v0-color']->var_name );
		$this->assertSame( $dynamic_node, $definitions['--e-dyn-demo-v0-color']->dynamic_node );
		$this->assertSame( [ 'class_id' => 'demo' ], $definitions['--e-dyn-demo-v0-color']->meta );
	}

	public function test_register_skips_invalid_nodes(): void {
		$manager = Dynamic_Styles_Manager::instance();
		$manager->register( '--e-dyn-invalid', [ '$$type' => 'string', 'value' => 'x' ] );

		$this->assertEmpty( $manager->get_definitions() );
	}

	public function test_build_inline_style(): void {
		$manager = Dynamic_Styles_Manager::instance();

		$style = $manager->build_inline_style( [
			'--e-dyn-a' => '10',
			'--e-dyn-b' => '',
		] );

		$this->assertSame( '--e-dyn-a:10;', $style );
	}

	public function test_wrap_scoped_html_returns_original_when_values_empty(): void {
		$manager = Dynamic_Styles_Manager::instance();

		$this->assertSame( '<item />', $manager->wrap_scoped_html( '<item />', [] ) );
	}

	public function test_wrap_scoped_html_applies_variables(): void {
		$manager = Dynamic_Styles_Manager::instance();

		$html = $manager->wrap_scoped_html(
			'<item />',
			[ '--e-dyn-demo-v0-z-index' => '42' ],
			[ 'class' => 'e-loop-item e-loop-item-7' ]
		);

		$this->assertStringContainsString( 'class="e-loop-item e-loop-item-7"', $html );
		$this->assertStringContainsString( 'style="--e-dyn-demo-v0-z-index:42;"', $html );
		$this->assertStringContainsString( '<item />', $html );
	}
}
