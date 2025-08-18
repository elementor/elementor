<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Variables_Service;
use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Parsers\ParsedCss;

/**
 * @group css-converter
 */
class Test_Variables_Service extends Elementor_Test_Base {
	public function test_variables_from_css_string__hex_color_is_converted_and_normalized() {
		$mockParser = $this->createMock(CssParser::class);
		$mockParsedCss = $this->createMock(ParsedCss::class);
		$mockParser->method('parse')->willReturn($mockParsedCss);
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
		$this->assertContains( 'e-gv-color-hex-primary-color-variable', $ids );
	}

	public function test_variables_from_css_string__non_hex_variables_are_skipped_in_mvp() {
		$mockParser = $this->createMock(CssParser::class);
		$mockParsedCss = $this->createMock(ParsedCss::class);
		$mockParser->method('parse')->willReturn($mockParsedCss);
		$mockParser->method('extract_variables')->willReturn([
			['name' => '--color', 'value' => '#aabbcc'],
		]);
		$service = new Variables_Service($mockParser);
		$result = $service->variables_from_css_string(':root { --spacing: 16px; --color: #abc; }');
		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( '#aabbcc', $result[0]['value'] );
	}

	public function test_variables_from_css_string__color_variables_variations() {
		$mockParser = $this->createMock(CssParser::class);
		$mockParsedCss = $this->createMock(ParsedCss::class);
		$mockParser->method('parse')->willReturn($mockParsedCss);

		$mockParser->method('extract_variables')->willReturn([
			['name' => '--color-1', 'value' => '#aabbcc'],
			['name' => '--color-2', 'value' => '#000'],
			['name' => '--color-3', 'value' => '#000000f0'],
			['name' => '--color-4', 'value' => 'rgb(0, 255, 0)'],
			['name' => '--color-5', 'value' => 'rgba(0, 255, 0, 0.5)'],
		]);

		$service = new Variables_Service($mockParser);
		$result = $service->variables_from_css_string(':root { /* ... any css ... */ }');

		$this->assertIsArray( $result );

		$this->assertSame( '#aabbcc', $result[0]['value'] );
		$this->assertSame( '#000000', $result[1]['value'] );
		$this->assertSame( '#000000f0', $result[2]['value'] );

		$this->assertSame( 'rgb(0, 255, 0)', $result[3]['value'] );
		$this->assertSame( 'rgba(0, 255, 0, 0.5)', $result[4]['value'] );
	}

	public function test_variables_from_css_string__size_variables_variations() {
		$mockParser = $this->createMock(CssParser::class);
		$mockParsedCss = $this->createMock(ParsedCss::class);
		$mockParser->method('parse')->willReturn($mockParsedCss);

		$mockParser->method('extract_variables')->willReturn([
			['name' => '--size-1', 'value' => '16px'],
		]);

		$service = new Variables_Service($mockParser);
		$result = $service->variables_from_css_string(':root { /* ... any css ... */ }');

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( '16px', $result[0]['value'] );
	}
}
