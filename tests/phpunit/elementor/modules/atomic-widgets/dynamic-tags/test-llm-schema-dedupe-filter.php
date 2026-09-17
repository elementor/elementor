<?php

namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\DynamicTags\LLM_Schema_Dedupe_Filter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_LLM_Schema_Dedupe_Filter extends Elementor_Test_Base {

	public function test_apply__preserves_schema_without_dynamic() {
		// Arrange.
		$filter = new LLM_Schema_Dedupe_Filter();

		$schema = [
			'anyOf' => [
				[ 'properties' => [ '$$type' => [ 'const' => 'string' ] ] ],
				[ 'properties' => [ '$$type' => [ 'const' => 'number' ] ] ],
			],
		];

		// Act.
		$result = $filter->apply( $schema );

		// Assert.
		$this->assertSame( $schema, $result );
	}

	public function test_apply__preserves_dynamic_at_first_level() {
		// Arrange.
		$filter = new LLM_Schema_Dedupe_Filter();

		$schema = [
			'anyOf' => [
				[ 'properties' => [ '$$type' => [ 'const' => 'string' ] ] ],
				[ 'properties' => [ '$$type' => [ 'const' => 'dynamic' ] ] ],
			],
		];

		// Act.
		$result = $filter->apply( $schema );

		// Assert.
		$this->assertCount( 2, $result['anyOf'] );
		$this->assertSame( 'string', $result['anyOf'][0]['properties']['$$type']['const'] );
		$this->assertSame( 'dynamic', $result['anyOf'][1]['properties']['$$type']['const'] );
	}

	public function test_apply__removes_nested_dynamic_when_ancestor_offers_dynamic() {
		// Arrange.
		$filter = new LLM_Schema_Dedupe_Filter();

		$schema = [
			'anyOf' => [
				[
					'properties' => [
						'$$type' => [ 'const' => 'object' ],
						'value' => [
							'properties' => [
								'nested' => [
									'anyOf' => [
										[ 'properties' => [ '$$type' => [ 'const' => 'string' ] ] ],
										[ 'properties' => [ '$$type' => [ 'const' => 'dynamic' ] ] ],
									],
								],
							],
						],
					],
				],
				[ 'properties' => [ '$$type' => [ 'const' => 'dynamic' ] ] ],
			],
		];

		// Act.
		$result = $filter->apply( $schema );

		// Assert.
		$this->assertCount( 2, $result['anyOf'] );
		$this->assertSame( 'dynamic', $result['anyOf'][1]['properties']['$$type']['const'] );

		$nested = $result['anyOf'][0]['properties']['value']['properties']['nested'];

		$this->assertCount( 1, $nested['anyOf'] );
		$this->assertSame( 'string', $nested['anyOf'][0]['properties']['$$type']['const'] );
	}

	public function test_apply__preserves_dynamic_in_parallel_branches() {
		// Arrange.
		$filter = new LLM_Schema_Dedupe_Filter();

		$schema = [
			'properties' => [
				'branch1' => [
					'anyOf' => [
						[ 'properties' => [ '$$type' => [ 'const' => 'string' ] ] ],
						[ 'properties' => [ '$$type' => [ 'const' => 'dynamic' ] ] ],
					],
				],
				'branch2' => [
					'anyOf' => [
						[ 'properties' => [ '$$type' => [ 'const' => 'number' ] ] ],
						[ 'properties' => [ '$$type' => [ 'const' => 'dynamic' ] ] ],
					],
				],
			],
		];

		// Act.
		$result = $filter->apply( $schema );

		// Assert.
		$this->assertCount( 2, $result['properties']['branch1']['anyOf'] );
		$this->assertCount( 2, $result['properties']['branch2']['anyOf'] );
	}

	public function test_apply__processes_array_items() {
		// Arrange.
		$filter = new LLM_Schema_Dedupe_Filter();

		$schema = [
			'anyOf' => [
				[
					'properties' => [
						'$$type' => [ 'const' => 'array' ],
						'value' => [
							'items' => [
								'anyOf' => [
									[ 'properties' => [ '$$type' => [ 'const' => 'string' ] ] ],
									[ 'properties' => [ '$$type' => [ 'const' => 'dynamic' ] ] ],
								],
							],
						],
					],
				],
				[ 'properties' => [ '$$type' => [ 'const' => 'dynamic' ] ] ],
			],
		];

		// Act.
		$result = $filter->apply( $schema );

		// Assert.
		$items = $result['anyOf'][0]['properties']['value']['items'];

		$this->assertCount( 1, $items['anyOf'] );
		$this->assertSame( 'string', $items['anyOf'][0]['properties']['$$type']['const'] );
	}
}
