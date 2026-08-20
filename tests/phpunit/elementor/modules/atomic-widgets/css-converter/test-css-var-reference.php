<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Var_Reference;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Css_Var_Reference extends TestCase {

	/**
	 * @dataProvider references
	 */
	public function test_parse__extracts_variable_token( string $input, ?string $expected ) {
		$this->assertSame( $expected, Css_Var_Reference::parse( $input ) );
	}

	public function references(): array {
		return [
			'simple' => [ 'var(--primary-text)', 'primary-text' ],
			'with fallback' => [ 'var(--primary-text, #000)', 'primary-text' ],
			'without dashes prefix' => [ 'var(primary-text)', 'primary-text' ],
			'not a var' => [ '#ff0000', null ],
			'whitespace' => [ '  var( --spacing-md )  ', 'spacing-md' ],
		];
	}
}
