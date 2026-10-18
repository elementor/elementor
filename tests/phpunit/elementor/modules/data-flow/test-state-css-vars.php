<?php

use Elementor\Modules\DataFlow\State_Css_Vars;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_State_Css_Vars extends TestCase {

	public function test_to_declarations__writes_numbers_booleans_and_safe_strings() {
		// Act
		$declarations = State_Css_Vars::to_declarations( [
			'tilt' => 1.234567,
			'open' => true,
			'closed' => false,
			'color' => '#ff0',
		] );

		// Assert
		$this->assertSame( '--e-state-tilt:1.2346;--e-state-open:1;--e-state-closed:0;--e-state-color:#ff0', $declarations );
	}

	public function test_to_declarations__skips_unsafe_values_and_keys() {
		// Act
		$declarations = State_Css_Vars::to_declarations( [
			'injection' => 'red;} body{display:none',
			'url' => 'url(javascript:alert(1))',
			'markup' => '</style>',
			'long' => str_repeat( 'a', State_Css_Vars::MAX_STRING_LENGTH + 1 ),
			'list' => [ 1, 2 ],
			'empty' => '',
			'nothing' => null,
			'bad key;' => 1,
		] );

		// Assert
		$this->assertSame( '', $declarations );
	}
}
