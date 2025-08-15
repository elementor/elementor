<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Variables_Service;
use Elementor\Modules\CssConverter\Parsers\CssParser;

class Test_Variables_Service extends Elementor_Test_Base {
	public function test_variables_from_css_string__hex_color_is_converted_and_normalized() {
		$mockParser = $this->createMock(CssParser::class);
		$mockParser->method('parse')->willReturn('parsed');
		$mockParser->method('extract_variables')->willReturn([
			['name' => '--Primary-Color', 'value' => '#eeeeee'],
			['name' => '--secondary', 'value' => '#eeeeee'],
		]);
		$service = new Variables_Service($mockParser);
		$result = $service->variables_from_css_string(':root { --Primary-Color: #EEE; --secondary: #eeeeee; }');
		$this->assertIsArray( $result );
		$this->assertNotEmpty( $result );
		$values = array_column( $result, 'value' );
		$this->assertContains( '#eeeeee', $values );
		$ids = array_column( $result, 'id' );
		$this->assertContains( 'primary-color', $ids );
	}

	public function test_variables_from_css_string__non_hex_variables_are_skipped_in_mvp() {
		$mockParser = $this->createMock(CssParser::class);
		$mockParser->method('parse')->willReturn('parsed');
		$mockParser->method('extract_variables')->willReturn([
			['name' => '--color', 'value' => '#aabbcc'],
		]);
		$service = new Variables_Service($mockParser);
		$result = $service->variables_from_css_string(':root { --spacing: 16px; --color: #abc; }');
		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( '#aabbcc', $result[0]['value'] );
	}
}
