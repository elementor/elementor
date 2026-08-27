<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Icon_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Transformer extends Elementor_Test_Base {
	private const FA7_STAR_PATH_FRAGMENT = 'M309.5-18.9';

	public function test_transform__returns_inline_svg_for_font_awesome_7_icon() {
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
		$this->assertStringContainsString( 'viewBox="0 0 576 512"', $result['html'] );
		$this->assertStringContainsString( 'fill="currentColor"', $result['html'] );
		$this->assertStringContainsString( 'aria-hidden="true"', $result['html'] );
		$this->assertStringContainsString( 'overflow: visible', $result['html'] );
		$this->assertStringContainsString( self::FA7_STAR_PATH_FRAGMENT, $result['html'] );
		$this->assertStringNotContainsString( 'M259.3 17.8', $result['html'] );
	}

	public function test_transform__resolves_font_awesome_7_icon_by_alias() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'fas fa-headphones-simple',
			'library' => 'fa-solid',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertStringContainsString( '<svg', $result['html'] );
		$this->assertStringContainsString( '<path', $result['html'] );
		$this->assertStringNotContainsString( 'viewBox="0 0 0 0"', $result['html'] );
	}

	public function test_transform__returns_empty_html_for_unknown_font_awesome_icon() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'fas fa-not-a-real-icon-name',
			'library' => 'fa-solid',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( [
			'html' => '',
			'url' => null,
		], $result );
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

	public function test_transform__returns_inline_svg_for_eicons_library() {
		// Arrange.
		$transformer = new Icon_Transformer();
		$value = [
			'value' => 'eicon-star',
			'library' => 'eicons',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertStringContainsString( '<svg', $result['html'] );
		$this->assertStringContainsString( '<path', $result['html'] );
	}
}
