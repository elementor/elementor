<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Custom_Css_Sanitizer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Custom_Css_Sanitizer extends TestCase {

	private Custom_Css_Sanitizer $sanitizer;

	public function setUp(): void {
		parent::setUp();

		$this->sanitizer = Custom_Css_Sanitizer::make();
	}

	public function test_sanitize__allows_modern_css_features(): void {
		// Arrange.
		$css = <<<'CSS'
&:hover { color: red; }
&:focus-visible { outline: 2px solid blue; }
&:nth-child(2n+1) { margin: 0; }
&:has(> .child) { padding: 1rem; }
.parent > .child::marker { content: '•'; }
@media (max-width: 767px) { font-size: 14px; }
@container (min-width: 400px) { display: grid; }
@supports (width < 100px) { color: green; }
CSS;

		// Act.
		$result = $this->sanitizer->sanitize( $css );

		// Assert.
		$this->assertSame( $css, $result );
	}

	public function test_sanitize__removes_javascript_urls(): void {
		// Arrange.
		$css = 'background: url(javascript:alert(1)); color: red;';

		// Act.
		$result = $this->sanitizer->sanitize( $css );

		// Assert.
		$this->assertStringNotContainsString( 'javascript:', strtolower( $result ) );
		$this->assertStringContainsString( 'color: red;', $result );
	}

	public function test_sanitize__removes_expression_calls(): void {
		// Arrange.
		$css = 'width: expression(alert(1)); height: 10px;';

		// Act.
		$result = $this->sanitizer->sanitize( $css );

		// Assert.
		$this->assertStringNotContainsString( 'expression', strtolower( $result ) );
		$this->assertStringContainsString( 'height: 10px;', $result );
	}

	public function test_sanitize__removes_expression_calls_with_whitespace_before_paren(): void {
		// Arrange.
		$css = 'width: expression (alert(1)); height: 10px;';

		// Act.
		$result = $this->sanitizer->sanitize( $css );

		// Assert.
		$this->assertStringNotContainsString( 'expression', strtolower( $result ) );
		$this->assertStringContainsString( 'height: 10px;', $result );
	}

	public function test_sanitize__neutralizes_javascript_urls_obfuscated_with_css_escapes(): void {
		// Arrange.
		$css = 'background: url(\6avascript:alert(1)); color: red;';

		// Act.
		$result = $this->sanitizer->sanitize( $css );

		// Assert.
		$this->assertStringNotContainsString( 'javascript:', strtolower( $result ) );
		$this->assertStringContainsString( 'color: red;', $result );
	}

	public function test_sanitize__removes_style_breakout(): void {
		// Arrange.
		$css = 'color: red; }</style><script>alert(1)</script>';

		// Act.
		$result = $this->sanitizer->sanitize( $css );

		// Assert.
		$this->assertStringNotContainsString( '</style>', strtolower( $result ) );
		$this->assertStringNotContainsString( '<script', strtolower( $result ) );
		$this->assertStringContainsString( 'color: red;', $result );
	}

	public function test_sanitize__removes_behavior_and_moz_binding(): void {
		// Arrange.
		$css = 'behavior: url(x.htc); -moz-binding: url(x.xml#x); color: navy;';

		// Act.
		$result = $this->sanitizer->sanitize( $css );

		// Assert.
		$this->assertStringNotContainsString( 'behavior:', strtolower( $result ) );
		$this->assertStringNotContainsString( '-moz-binding', strtolower( $result ) );
		$this->assertStringContainsString( 'color: navy;', $result );
	}

	public function test_sanitize__removes_data_text_html_urls(): void {
		// Arrange.
		$css = 'background: url(data:text/html,<script>alert(1)</script>); color: black;';

		// Act.
		$result = $this->sanitizer->sanitize( $css );

		// Assert.
		$this->assertStringNotContainsString( 'data:text/html', strtolower( $result ) );
		$this->assertStringContainsString( 'color: black;', $result );
	}
}
