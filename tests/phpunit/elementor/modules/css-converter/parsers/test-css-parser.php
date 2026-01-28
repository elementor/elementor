<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Parsers\CssParser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 */
class Test_Css_Parser extends Elementor_Test_Base {

	public function test_extracts_root_variables() {

		$css = ':root { --primary: #007cba; --spacing-md: 16px; } html { --font: Arial; }';
		$parser = new CssParser();
		$parsed = $parser->parse( $css );
		$vars = $parser->extract_variables( $parsed );

		$this->assertArrayHasKey( '--primary', $vars );
		$this->assertSame( '#007cba', $vars['--primary']['value'] );

		$this->assertArrayHasKey( '--spacing-md', $vars );
		$this->assertSame( '16px', $vars['--spacing-md']['value'] );

		$this->assertArrayHasKey( '--font', $vars );
		$this->assertSame( 'Arial', $vars['--font']['value'] );
	}

	public function test_ignores_non_variable_properties() {

		$css = '.btn { color: red; } :root { --primary: #000; }';
		$parser = new CssParser();
		$parsed = $parser->parse( $css );
		$vars = $parser->extract_variables( $parsed );

		$this->assertArrayHasKey( '--primary', $vars );
		$this->assertArrayNotHasKey( 'color', $vars );
	}

	public function test_reports_conversion_summary_for_variables() {
		return $this->markTestSkipped( 'Not implemented' );

		$css = ':root { --x: 1; }';
		$parser = new CssParser();
		$summary = $parser->get_conversion_summary( $parser->parse( $css ) );

		$this->assertSame( 1, $summary['variables']['count'] );
		$this->assertContains( '--x', $summary['variables']['names'] );
	}
}


