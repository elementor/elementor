<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpCli\i18n;

use Elementor\Modules\WpCli\i18n\Translations_Extractor;
use Elementor\Testing\Elementor_Test_Base;

class Test_Translations_Extractor extends Elementor_Test_Base {
	/**
	 * @var \Elementor\Modules\WpCli\i18n\Translations_Extractor
	 */
	private $string_extractor;

	public function setUp() {
		parent::setUp();

		$this->string_extractor = new Translations_Extractor();
	}

	public function test_find_function_calls_js() {
		$code = file_get_contents( __DIR__ . '/mock/js/simple.js' );

		$actual = $this->string_extractor->extract_from_code( $code, 'simple.js' );

		$this->assertEqualSets( [
			'entries' => [
				'text' => [
					'is_plural' => false,
					'context' => null,
					'singular' => 'text',
					'plural' => null,
					'translations' => [],
					'translator_comments' => '',
					'extracted_comments' => '',
					'references' => [
						0 => 'simple.js:2',
					],
					'flags' => [],
				],
				'text-same-line-0' => [
					'is_plural' => false,
					'context' => null,
					'singular' => 'text-same-line-0',
					'plural' => null,
					'translations' => [],
					'translator_comments' => '',
					'extracted_comments' => '',
					'references' => [
						0 => 'simple.js:4',
					],
					'flags' => [],
				],
				'text-same-line-1' => [
					'is_plural' => false,
					'context' => null,
					'singular' => 'text-same-line-1',
					'plural' => null,
					'translations' => [],
					'translator_comments' => '',
					'extracted_comments' => '',
					'references' => [
						0 => 'simple.js:4',
					],
					'flags' => [],
				],
				'text __(\'really wired\')' => [
					'is_plural' => false,
					'context' => null,
					'singular' => 'text __(\'really wired\')',
					'plural' => null,
					'translations' => [],
					'translator_comments' => '',
					'extracted_comments' => '',
					'references' => [
						0 => 'simple.js:6',
					],
					'flags' => [],
				],
			],
			'headers' => [],
		], json_decode( json_encode( $actual ), true ) );
	}

	public function test_find_function_calls_js__singular_plural() {
		$code = file_get_contents( __DIR__ . '/mock/js/singular-plural.js' );

		$actual = $this->string_extractor->extract_from_code( $code, 'singular-plural.js' );

		$this->assertCount( 1, $actual->entries );

		$actual = (array) $actual->entries['%d is one item'];

		$this->assertEquals( true, $actual['is_plural'] );
		$this->assertEquals( '%d is one item', $actual['singular'] );
		$this->assertEquals( '%d is two items', $actual['plural'] );
	}
}
