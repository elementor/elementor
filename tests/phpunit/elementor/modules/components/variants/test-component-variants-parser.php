<?php

namespace Elementor\Testing\Modules\Components\Variants;

use Elementor\Modules\Components\Variants\Component_Variants_Parser;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Variants_Parser extends Elementor_Test_Base {

	private Component_Variants_Parser $parser;

	public function setUp(): void {
		parent::setUp();

		$this->parser = Component_Variants_Parser::make();
	}

	public function test_parse__with_valid_data__succeeds() {
		// Arrange.
		$valid_data = [
			'variants' => [
				[
					'id'    => 'v_g8k3nq00',
					'label' => 'Green',
					'widgets' => [
						'e-button-123' => [
							'settings' => [ 'classes' => [ 'add' => [ 'g_abc123' ] ] ],
							'variant'  => 'v_btn_succ',
						],
					],
				],
			],
		];

		// Act.
		$result = $this->parser->parse( $valid_data );

		// Assert.
		$this->assertTrue( $result->is_valid(), $result->errors()->to_string() );
		$unwrapped = $result->unwrap();
		$this->assertCount( 1, $unwrapped['variants'] );
		$this->assertEquals( 'v_g8k3nq00', $unwrapped['variants'][0]['id'] );
		$this->assertEquals( 'Green', $unwrapped['variants'][0]['label'] );
		$this->assertEquals( [ 'g_abc123' ], $unwrapped['variants'][0]['widgets']['e-button-123']['settings']['classes']['add'] );
		$this->assertEquals( 'v_btn_succ', $unwrapped['variants'][0]['widgets']['e-button-123']['variant'] );
	}

	public function test_parse__with_empty_data__returns_empty() {
		// Arrange & Act.
		$result = $this->parser->parse( [] );

		// Assert.
		$this->assertTrue( $result->is_valid() );
		$this->assertEquals( [], $result->unwrap() );
	}

	public function test_parse__rejects_nested_settings_variant() {
		// Arrange - HLD §4.1 forbids `settings.variant` (only sibling `variant` allowed).
		$data = [
			'variants' => [
				[
					'id'    => 'v_g8k3nq00',
					'label' => 'Green',
					'widgets' => [
						'e-button-123' => [
							'settings' => [ 'variant' => 'v_nested__' ],
						],
					],
				],
			],
		];

		// Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertStringContainsString( 'nested_variant_forbidden', $result->errors()->to_string() );
	}

	public function test_parse__rejects_duplicate_variant_ids() {
		// Arrange.
		$data = [
			'variants' => [
				[ 'id' => 'v_g8k3nq00', 'label' => 'A', 'widgets' => [] ],
				[ 'id' => 'v_g8k3nq00', 'label' => 'B', 'widgets' => [] ],
			],
		];

		// Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertStringContainsString( 'duplicate_id', $result->errors()->to_string() );
	}

	public function test_parse__rejects_invalid_class_id() {
		// Arrange - class ids must match /^[a-z][a-z-_0-9]*$/i.
		$data = [
			'variants' => [
				[
					'id'    => 'v_g8k3nq00',
					'label' => 'Green',
					'widgets' => [
						'e-button-123' => [
							'settings' => [ 'classes' => [ 'add' => [ '9-invalid-starts-with-digit' ] ] ],
						],
					],
				],
			],
		];

		// Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertStringContainsString( 'invalid_class_id', $result->errors()->to_string() );
	}

	public function test_parse__ignores_unknown_class_actions() {
		// Arrange - remove/replace keys are intentionally dropped (HLD §4.1).
		$data = [
			'variants' => [
				[
					'id'    => 'v_g8k3nq00',
					'label' => 'Green',
					'widgets' => [
						'e-button-123' => [
							'settings' => [
								'classes' => [
									'add'     => [ 'g_abc123' ],
									'remove'  => [ 'g_should_be_ignored' ],
									'replace' => [ 'g_also_ignored' ],
								],
							],
						],
					],
				],
			],
		];

		// Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertTrue( $result->is_valid(), $result->errors()->to_string() );
		$classes = $result->unwrap()['variants'][0]['widgets']['e-button-123']['settings']['classes'];
		$this->assertEquals( [ 'add' => [ 'g_abc123' ] ], $classes );
	}

	public function test_parse__rejects_invalid_variant_id_format() {
		// Arrange.
		$data = [
			'variants' => [
				[ 'id' => 'not-a-valid-id', 'label' => 'X', 'widgets' => [] ],
			],
		];

		// Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertStringContainsString( 'invalid_format', $result->errors()->to_string() );
	}

	public function test_parse__rejects_invalid_nested_variant_id() {
		// Arrange.
		$data = [
			'variants' => [
				[
					'id'    => 'v_g8k3nq00',
					'label' => 'X',
					'widgets' => [
						'e-button-123' => [ 'variant' => 'not-a-valid-id' ],
					],
				],
			],
		];

		// Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertStringContainsString( 'invalid_variant_id', $result->errors()->to_string() );
	}

	public function test_parse__rejects_missing_required_fields() {
		// Arrange.
		$data = [
			'variants' => [
				[ 'label' => 'Missing id', 'widgets' => [] ],
			],
		];

		// Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertStringContainsString( 'missing_field', $result->errors()->to_string() );
	}

	public function test_parse__rejects_non_array_variants() {
		// Arrange.
		$data = [ 'variants' => 'not-an-array' ];

		// Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertStringContainsString( 'invalid_structure', $result->errors()->to_string() );
	}

	public function test_parse__sanitizes_label() {
		// Arrange.
		$data = [
			'variants' => [
				[ 'id' => 'v_g8k3nq00', 'label' => '<script>alert(1)</script>Green', 'widgets' => [] ],
			],
		];

		// Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertTrue( $result->is_valid(), $result->errors()->to_string() );
		$this->assertEquals( 'Green', $result->unwrap()['variants'][0]['label'] );
	}
}
