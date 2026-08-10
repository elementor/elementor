<?php

namespace Elementor\Testing\Modules\Components\Schema;

use Elementor\Modules\Components\Schema\Overridable_LLM_Filter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Overridable_LLM_Filter extends Elementor_Test_Base {

	public function test_apply__preserves_schema_without_overridable() {
		// Arrange.
		$filter = new Overridable_LLM_Filter();

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

	public function test_apply__removes_overridable_branch() {
		// Arrange.
		$filter = new Overridable_LLM_Filter();

		$schema = [
			'anyOf' => [
				[ 'properties' => [ '$$type' => [ 'const' => 'string' ] ] ],
				[ 'properties' => [ '$$type' => [ 'const' => 'overridable' ] ] ],
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

	public function test_apply__removes_nested_overridable() {
		// Arrange.
		$filter = new Overridable_LLM_Filter();

		$schema = [
			'properties' => [
				'nested' => [
					'anyOf' => [
						[ 'properties' => [ '$$type' => [ 'const' => 'string' ] ] ],
						[ 'properties' => [ '$$type' => [ 'const' => 'overridable' ] ] ],
					],
				],
			],
		];

		// Act.
		$result = $filter->apply( $schema );

		// Assert.
		$nested = $result['properties']['nested'];

		$this->assertCount( 1, $nested['anyOf'] );
		$this->assertSame( 'string', $nested['anyOf'][0]['properties']['$$type']['const'] );
	}

	public function test_apply__processes_array_items() {
		// Arrange.
		$filter = new Overridable_LLM_Filter();

		$schema = [
			'items' => [
				'anyOf' => [
					[ 'properties' => [ '$$type' => [ 'const' => 'string' ] ] ],
					[ 'properties' => [ '$$type' => [ 'const' => 'overridable' ] ] ],
				],
			],
		];

		// Act.
		$result = $filter->apply( $schema );

		// Assert.
		$items = $result['items'];

		$this->assertCount( 1, $items['anyOf'] );
		$this->assertSame( 'string', $items['anyOf'][0]['properties']['$$type']['const'] );
	}
}
