<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Grid_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Grid_Transformer extends Elementor_Test_Base {

	public function test_transform__repeat_tracks_and_gaps() {
		$transformer = new Grid_Transformer();
		$context = Props_Resolver_Context::make()->set_key( 'grid' );

		$result = $transformer->transform( [
			'columnsCount' => 3,
			'rowsCount' => 2,
			'columnsTemplate' => '',
			'rowsTemplate' => '',
			'columnGap' => '12px',
			'rowGap' => '8px',
			'autoFlow' => 'row',
		], $context );

		$this->assertTrue( Multi_Props::is( $result ) );
		$props = Multi_Props::get_value( $result );
		$this->assertSame( 'repeat(3, 1fr)', $props['grid-template-columns'] );
		$this->assertSame( 'repeat(2, 1fr)', $props['grid-template-rows'] );
		$this->assertSame( '12px', $props['column-gap'] );
		$this->assertSame( '8px', $props['row-gap'] );
		$this->assertSame( 'row', $props['grid-auto-flow'] );
	}

	public function test_transform__custom_templates_override_counts() {
		$transformer = new Grid_Transformer();
		$context = Props_Resolver_Context::make()->set_key( 'grid' );

		$result = $transformer->transform( [
			'columnsCount' => 1,
			'rowsCount' => 1,
			'columnsTemplate' => '1fr 2fr',
			'rowsTemplate' => 'auto',
			'columnGap' => '',
			'rowGap' => '',
			'autoFlow' => 'column dense',
		], $context );

		$props = Multi_Props::get_value( $result );
		$this->assertSame( '1fr 2fr', $props['grid-template-columns'] );
		$this->assertSame( 'auto', $props['grid-template-rows'] );
		$this->assertSame( 'column dense', $props['grid-auto-flow'] );
		$this->assertArrayNotHasKey( 'column-gap', $props );
	}
}
