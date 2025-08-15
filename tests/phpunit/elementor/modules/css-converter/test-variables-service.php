<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Variables_Service;

class Test_Variables_Service extends Elementor_Test_Base {
	public function test_variables_from_css_string__hex_color_is_converted_and_normalized() {
		$css = ':root { --Primary-Color: #EEE; --secondary: #eeeeee; }';
		$service = new Variables_Service();
		$result = $service->variables_from_css_string( $css );

		$this->assertIsArray( $result );
		$this->assertNotEmpty( $result );
		$values = array_column( $result, 'value' );
		$this->assertContains( '#eeeeee', $values );
		$ids = array_column( $result, 'id' );
		$this->assertContains( 'primary-color', $ids );
	}

	public function test_variables_from_css_string__non_hex_variables_are_skipped_in_mvp() {
		$css = ':root { --spacing: 16px; --color: #abc; }';
		$service = new Variables_Service();
		$result = $service->variables_from_css_string( $css );

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( '#aabbcc', $result[0]['value'] );
	}
}
