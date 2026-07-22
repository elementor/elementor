<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Plain_Llm_Schema_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Plain_Llm_Schema_Converter extends TestCase {

	public function test_convert__string_envelope__unwraps_to_plain_string() {
		$envelope = [
			'type' => 'object',
			'description' => 'A title',
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'string' ],
				'value' => [ 'type' => 'string' ],
			],
			'required' => [ '$$type', 'value' ],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertSame( [
			'type' => 'string',
			'description' => 'A title',
		], $plain );
	}

	public function test_convert__string_envelope_with_enum__preserves_enum() {
		$envelope = [
			'type' => 'object',
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'string' ],
				'value' => [ 'type' => 'string', 'enum' => [ 'h1', 'h2', 'h3' ] ],
			],
			'required' => [ '$$type', 'value' ],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertSame( [
			'type' => 'string',
			'enum' => [ 'h1', 'h2', 'h3' ],
		], $plain );
	}

	public function test_convert__number_envelope__unwraps_to_plain_number() {
		$envelope = [
			'type' => 'object',
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'number' ],
				'value' => [ 'type' => 'number' ],
			],
			'required' => [ '$$type', 'value' ],
		];

		$this->assertSame( [ 'type' => 'number' ], Plain_Llm_Schema_Converter::convert( $envelope ) );
	}

	public function test_convert__boolean_envelope__unwraps_to_plain_boolean() {
		$envelope = [
			'type' => 'object',
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'boolean' ],
				'value' => [ 'type' => 'boolean' ],
			],
			'required' => [ '$$type', 'value' ],
		];

		$this->assertSame( [ 'type' => 'boolean' ], Plain_Llm_Schema_Converter::convert( $envelope ) );
	}

	public function test_convert__preserves_description_and_examples() {
		$envelope = [
			'type' => 'object',
			'description' => 'A number property',
			'examples' => [ 42 ],
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'number' ],
				'value' => [ 'type' => 'number' ],
			],
			'required' => [ '$$type', 'value' ],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertSame( 'A number property', $plain['description'] );
		$this->assertSame( [ 42 ], $plain['examples'] );
		$this->assertSame( 'number', $plain['type'] );
	}

	public function test_convert__object_envelope__unwraps_value_and_recurses_into_properties() {
		$envelope = [
			'type' => 'object',
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'size' ],
				'value' => [
					'type' => 'object',
					'properties' => [
						'size' => [
							'type' => 'object',
							'properties' => [
								'$$type' => [ 'type' => 'string', 'const' => 'number' ],
								'value' => [ 'type' => 'number' ],
							],
							'required' => [ '$$type', 'value' ],
						],
						'unit' => [
							'type' => 'object',
							'properties' => [
								'$$type' => [ 'type' => 'string', 'const' => 'string' ],
								'value' => [ 'type' => 'string' ],
							],
							'required' => [ '$$type', 'value' ],
						],
					],
					'additionalProperties' => false,
				],
			],
			'required' => [ '$$type', 'value' ],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertSame( 'object', $plain['type'] );
		$this->assertSame( [ 'type' => 'number' ], $plain['properties']['size'] );
		$this->assertSame( [ 'type' => 'string' ], $plain['properties']['unit'] );
		$this->assertFalse( $plain['additionalProperties'] );
	}

	public function test_convert__array_envelope__unwraps_and_recurses_into_items() {
		$envelope = [
			'type' => 'object',
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'classes' ],
				'value' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
				],
			],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertSame( [
			'type' => 'array',
			'items' => [ 'type' => 'string' ],
		], $plain );
	}

	public function test_convert__dynamic_envelope__hoists_name_and_settings() {
		$envelope = [
			'type' => 'object',
			'description' => 'Bind THIS value to a dynamic tag...',
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'dynamic' ],
				'value' => [
					'type' => 'object',
					'properties' => [
						'name' => [ 'type' => 'string', 'enum' => [ 'post-title' ] ],
						'settings' => [ 'type' => 'object' ],
					],
					'required' => [ 'name' ],
				],
			],
			'required' => [ '$$type', 'value' ],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertSame( 'object', $plain['type'] );
		$this->assertSame( 'Bind THIS value to a dynamic tag...', $plain['description'] );
		$this->assertSame( [ 'type' => 'string', 'enum' => [ 'post-title' ] ], $plain['properties']['name'] );
		$this->assertSame( [ 'type' => 'object' ], $plain['properties']['settings'] );
		$this->assertSame( [ 'name' ], $plain['required'] );
	}

	public function test_convert__html_v3_envelope__unwraps_nested_string_content() {
		$envelope = [
			'type' => 'object',
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'html-v3' ],
				'value' => [
					'type' => 'object',
					'properties' => [
						'content' => [
							'type' => 'object',
							'properties' => [
								'$$type' => [ 'type' => 'string', 'const' => 'string' ],
								'value' => [ 'type' => 'string' ],
							],
							'required' => [ '$$type', 'value' ],
						],
						'children' => [ 'description' => 'Plain array of child element objects' ],
					],
					'additionalProperties' => false,
				],
			],
			'required' => [ '$$type', 'value' ],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertSame( 'object', $plain['type'] );
		$this->assertSame( [ 'type' => 'string' ], $plain['properties']['content'] );
		$this->assertSame( [ 'description' => 'Plain array of child element objects' ], $plain['properties']['children'] );
	}

	public function test_convert__union__recurses_all_branches_and_dedupes() {
		$envelope = [
			'description' => 'union of string and global-color-variable',
			'anyOf' => [
				[
					'type' => 'object',
					'properties' => [
						'$$type' => [ 'type' => 'string', 'const' => 'string' ],
						'value' => [ 'type' => 'string' ],
					],
					'required' => [ '$$type', 'value' ],
				],
				[
					'type' => 'object',
					'properties' => [
						'$$type' => [ 'type' => 'string', 'const' => 'global-color-variable' ],
						'value' => [ 'type' => 'string' ],
					],
					'required' => [ '$$type', 'value' ],
				],
			],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertSame( 'union of string and global-color-variable', $plain['description'] );
		$this->assertCount( 1, $plain['anyOf'], 'identical unwrapped branches should collapse' );
		$this->assertSame( [ 'type' => 'string' ], $plain['anyOf'][0] );
	}

	public function test_convert__union_with_distinct_branches__preserves_all() {
		$envelope = [
			'anyOf' => [
				[
					'type' => 'object',
					'properties' => [
						'$$type' => [ 'type' => 'string', 'const' => 'string' ],
						'value' => [ 'type' => 'string' ],
					],
					'required' => [ '$$type', 'value' ],
				],
				[
					'type' => 'object',
					'properties' => [
						'$$type' => [ 'type' => 'string', 'const' => 'dynamic' ],
						'value' => [
							'type' => 'object',
							'properties' => [
								'name' => [ 'type' => 'string' ],
								'settings' => [ 'type' => 'object' ],
							],
							'required' => [ 'name' ],
						],
					],
					'required' => [ '$$type', 'value' ],
				],
			],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertCount( 2, $plain['anyOf'] );
		$this->assertSame( 'string', $plain['anyOf'][0]['type'] );
		$this->assertSame( 'object', $plain['anyOf'][1]['type'] );
		$this->assertArrayHasKey( 'name', $plain['anyOf'][1]['properties'] );
	}

	public function test_convert__non_envelope_schema__passes_through_unchanged() {
		$schema = [
			'type' => 'object',
			'properties' => [
				'foo' => [ 'type' => 'string' ],
			],
		];

		$this->assertSame( $schema, Plain_Llm_Schema_Converter::convert( $schema ) );
	}

	public function test_convert__empty_schema__returns_empty() {
		$this->assertSame( [], Plain_Llm_Schema_Converter::convert( [] ) );
	}

	public function test_convert__deeply_nested_envelopes__unwraps_at_every_level() {
		$envelope = [
			'type' => 'object',
			'properties' => [
				'$$type' => [ 'type' => 'string', 'const' => 'outer' ],
				'value' => [
					'type' => 'object',
					'properties' => [
						'items' => [
							'type' => 'object',
							'properties' => [
								'$$type' => [ 'type' => 'string', 'const' => 'array-key' ],
								'value' => [
									'type' => 'array',
									'items' => [
										'type' => 'object',
										'properties' => [
											'$$type' => [ 'type' => 'string', 'const' => 'string' ],
											'value' => [ 'type' => 'string' ],
										],
										'required' => [ '$$type', 'value' ],
									],
								],
							],
						],
					],
				],
			],
			'required' => [ '$$type', 'value' ],
		];

		$plain = Plain_Llm_Schema_Converter::convert( $envelope );

		$this->assertSame( 'object', $plain['type'] );
		$this->assertSame( 'array', $plain['properties']['items']['type'] );
		$this->assertSame( [ 'type' => 'string' ], $plain['properties']['items']['items'] );
	}
}
