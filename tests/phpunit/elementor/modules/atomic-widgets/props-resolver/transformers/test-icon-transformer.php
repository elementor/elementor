<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Icon_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Transformer extends Elementor_Test_Base {
	public function test_transform__returns_inline_svg_for_font_awesome_icon() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'fas fa-star',
			'library' => 'fa-solid',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertNull( $result['url'] );
		$this->assertStringContainsString( '<svg', $result['html'] );
		$this->assertStringContainsString( 'fill="currentColor"', $result['html'] );
		$this->assertStringContainsString( '<path', $result['html'] );
	}

	public function test_transform__returns_empty_html_for_unknown_library() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'eicon-star',
			'library' => 'not-a-library',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( [
			'html' => '',
			'url' => null,
		], $result );
	}
}
