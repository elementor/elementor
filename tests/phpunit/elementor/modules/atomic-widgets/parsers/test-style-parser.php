<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Parsers;

use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Parsers\Parse_Result;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Style_Parser extends Elementor_Test_Base {
	/**
	 * @var array
	 */
	private $schema;

	/**
	 * @var Style_Parser
	 */
	private $parser;

	public function setUp(): void {
		parent::setUp();

		// Define a test schema for prop validation
		$this->schema = [];

		$this->parser = Style_Parser::make([]);
	}

	public function test_valid_style_is_validated_successfully() {
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'Test Style',
			'variants' => [
				[
					'meta' => [
						'state' => null,
						'breakpoint' => 'desktop',
					],
					'props' => [
						'color' => [
                            'value' => '#000000',
                        ]
					],
				],
			],
		];

		$result = $this->parser->parse($style);

        $this->assertTrue($result->is_valid());
        $this->assertCount(0, $result->errors()->all());
	}

	public function test_invalid_style_id_fails_validation() {
		$style = [
			'type' => 'class',
			'label' => 'Test Style',
			'variants' => [],
		];

        $result = $this->parser->parse($style);
		
		$this->assertParseResultInvalid($result, [ 'id' ]);   
	}

	public function test_invalid_style_type_fails_validation() {
		$style = [
			'id' => 'test-style',
			'type' => 'invalid-type',
			'label' => 'Test Style',
			'variants' => [],
		];

        $result = $this->parser->parse($style);
		
        $this->assertParseResultInvalid($result, [ 'type' ]);
	}

	public function test_invalid_style_label_fails_validation() {
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'variants' => [],
		];
		
        $result = $this->parser->parse($style);
		
		$this->assertParseResultInvalid($result, [ 'label' ]);
	}

	public function test_invalid_variants_fails_validation() {
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'Test Style',
			'variants' => 'not-an-array',
		];

        $result = $this->parser->parse($style);
		
		$this->assertParseResultInvalid($result, [ 'variants' ]);
	}

	public function test_invalid_meta_fails_validation() {
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'Test Style',
			'variants' => [
				[
					'props' => [],
				],
			],
		];

        $result = $this->parser->parse($style);
		
		$this->assertParseResultInvalid($result, [ 'meta' ]);
	}

	public function test_invalid_meta_state_fails_validation() {
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'Test Style',
			'variants' => [
				[
					'meta' => [
						'state' => 'invalid-state',
						'breakpoint' => 'desktop',
					],
					'props' => [],
				],
			],
		];

        $result = $this->parser->parse($style);
		
		$this->assertParseResultInvalid($result, [ 'meta.state' ]);
	}

	public function test_invalid_meta_breakpoint_fails_validation() {
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'Test Style',
			'variants' => [
				[
					'meta' => [
						'state' => null,
						'breakpoint' => null,
					],
					'props' => [],
				],
			],
		];

        $result = $this->parser->parse($style);
		
        $this->assertParseResultInvalid($result, [ 'meta.breakpoint' ]);
	}

	public function test_sanitize_sanitizes_label_and_id() {
		$style = [
			'id' => 'test<script>alert(1)</script>-style',
			'type' => 'class',
			'label' => 'Test <strong>Style</strong>',
			'variants' => [],
		];

		$result = $this->parser->parse($style);
		$sanitized = $result->unwrap();
		
		$this->assertEquals('test-style', $sanitized['id']);
		$this->assertEquals('Test Style', $sanitized['label']);
	}

	public function test_parse_validates_and_sanitizes() {
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'Test Style',
			'variants' => [
				[
					'meta' => [
						'state' => null,
						'breakpoint' => 'desktop',
					],
					'props' => [
						'color' => [
                            '$$type' => 'color',
                            'value' => '#000000',
                        ]
					],
				],
			],
		];

		$result = $this->parser->parse($style);
		
		$this->assertTrue($result->is_valid());
		
		$parsed = $result->unwrap();
		$this->assertEquals('test-style', $parsed['id']);
		$this->assertEquals('Test Style', $parsed['label']);
		$this->assertEquals('class', $parsed['type']);
	}

    private function assertParseResultInvalid( Parse_Result $result, array $errors ) {
        $this->assertFalse( $result->is_valid() );

        $this->assertEquals( $errors, array_map( fn ( $error ) => $error['key'], 
        $result->errors()->all() ) );
    }

} 