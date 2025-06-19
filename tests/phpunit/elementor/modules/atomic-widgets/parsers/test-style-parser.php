<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Parsers;

use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Parsers\Parse_Result;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Style_Parser extends Elementor_Test_Base {
	private Style_Parser $parser;

	public function setUp(): void {
		parent::setUp();

		$this->parser = Style_Parser::make( [] );
	}

	public function test_parse__valid_style_is_validated_successfully() {
        // Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'test-style',
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

        // Act.
		$result = $this->parser->parse( $style );

        // Assert.
        $this->assertTrue( $result->is_valid() );
        $this->assertCount( 0, $result->errors()->all() );
	}

	public function test_parse__missing_style_id_fails_validation() {
        // Arrange.
		$style = [
			'type' => 'class',
			'label' => 'test-style',
			'variants' => [],
		];

        // Act.
        $result = $this->parser->parse( $style );

        // Assert.
		$this->assert_parse_result_invalid( $result, [ 'id' ] );
	}

	public function test_parse__invalid_style_type_fails_validation() {
        // Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'invalid-type',
			'label' => 'test-style',
			'variants' => [],
		];

        // Act.
        $result = $this->parser->parse( $style );

        // Assert.
        $this->assert_parse_result_invalid( $result, [ 'type' ] );
	}

	public function test_parse__missing_style_label_fails_validation() {
        // Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'variants' => [],
		];

        // Act.
        $result = $this->parser->parse( $style );

        // Assert.
		$this->assert_parse_result_invalid( $result, [ 'label' ] );
	}

	public function test_parse__invalid_variants_fails_validation() {
        // Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'test-style',
			'variants' => 'not-an-array',
		];

        // Act.
        $result = $this->parser->parse( $style );

        // Assert.
		$this->assert_parse_result_invalid( $result, [ 'variants' ] );
	}

	public function test_parse__missing_meta_fails_validation() {
		// Arrange.
        $style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'test-style',
			'variants' => [
				[
					'props' => [],
					'meta' => null,
				],
			],
		];

        // Act.
        $result = $this->parser->parse( $style );

        // Assert.
		$this->assert_parse_result_invalid( $result, [ 'meta' ] );
	}

	public function test_parse__invalid_meta_state_fails_validation() {
		// Arrange.
        $style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'test-style',
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

        // Act.
        $result = $this->parser->parse( $style );

        // Assert.
		$this->assert_parse_result_invalid( $result, [ 'meta.state' ] );
	}

	public function test_parse__invalid_meta_breakpoint_fails_validation() {
		// Arrange.
        $style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'test-style',
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

        // Act.
        $result = $this->parser->parse( $style );

        // Assert.
        $this->assert_parse_result_invalid ( $result, [ 'meta.breakpoint' ] );
	}

	public function test_parse__validates_and_sanitizes() {
		// Arrange.
        $style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'test-style',
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

        // Act.
		$result = $this->parser->parse( $style );
		$parsed = $result->unwrap();

        // Assert.
		$this->assertTrue( $result->is_valid() );

		$this->assertEquals( 'test-style', $parsed['id'] );
		$this->assertEquals( 'test-style', $parsed['label'] );
		$this->assertEquals( 'class', $parsed['type'] );
	}

	public function test_parse__label_too_long_fails_validation() {
		// Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => str_repeat('a', 51), // 51 characters
			'variants' => [],
		];

		// Act.
		$result = $this->parser->parse($style);

		// Assert.
		$this->assert_parse_result_invalid($result, ['label']);
		$this->assertEquals('class_name_too_long', $result->errors()->all()[0]['error']);
	}

	public function test_parse__label_too_short_fails_validation() {
		// Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'a',
			'variants' => [],
		];

		// Act.
		$result = $this->parser->parse($style);

		// Assert.
		$this->assert_parse_result_invalid($result, ['label']);
		$this->assertEquals('class_name_too_short', $result->errors()->all()[0]['error']);
	}

	public function test_parse__label_with_reserved_name_fails_validation() {
		// Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'container',
			'variants' => [],
		];

		// Act.
		$result = $this->parser->parse($style);

		// Assert.
		$this->assert_parse_result_invalid($result, ['label']);
		$this->assertEquals('reserved_class_name', $result->errors()->all()[0]['error']);
	}

	public function test_parse__label_starting_with_number_fails_validation() {
		// Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => '1test',
			'variants' => [],
		];

		// Act.
		$result = $this->parser->parse($style);

		// Assert.
		$this->assert_parse_result_invalid($result, ['label']);
		$this->assertEquals('class_name_starts_with_digit', $result->errors()->all()[0]['error']);
	}

	public function test_parse__label_with_spaces_fails_validation() {
		// Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'test class',
			'variants' => [],
		];

		// Act.
		$result = $this->parser->parse($style);

		// Assert.
		$this->assert_parse_result_invalid($result, ['label']);
		$this->assertEquals('class_name_contains_spaces', $result->errors()->all()[0]['error']);
	}

	public function test_parse__label_with_invalid_chars_fails_validation() {
		// Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => 'test@class',
			'variants' => [],
		];

		// Act.
		$result = $this->parser->parse($style);

		// Assert.
		$this->assert_parse_result_invalid($result, ['label']);
		$this->assertEquals('class_name_invalid_chars', $result->errors()->all()[0]['error']);
	}

	public function test_parse__label_with_double_hyphen_fails_validation() {
		// Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => '--test-class',
			'variants' => [],
		];

		// Act.
		$result = $this->parser->parse($style);

		// Assert.
		$this->assert_parse_result_invalid($result, ['label']);
		$this->assertEquals('class_name_double_hyphen', $result->errors()->all()[0]['error']);
	}

	public function test_parse__label_starting_with_hyphen_digit_fails_validation() {
		// Arrange.
		$style = [
			'id' => 'test-style',
			'type' => 'class',
			'label' => '-1test',
			'variants' => [],
		];

		// Act.
		$result = $this->parser->parse($style);

		// Assert.
		$this->assert_parse_result_invalid($result, ['label']);
		$this->assertEquals('class_name_starts_with_hyphen_digit', $result->errors()->all()[0]['error']);
	}

    private function assert_parse_result_invalid( Parse_Result $result, array $errors ) {
        $this->assertFalse( $result->is_valid() );

        $this->assertEquals( $errors, array_map( fn ( $error ) => $error['key'],
        $result->errors()->all() ) );
    }
}
