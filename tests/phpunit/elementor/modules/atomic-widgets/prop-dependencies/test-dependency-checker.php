<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropDependencies;

use Elementor\Modules\AtomicWidgets\PropDependencies\Dependency_Checker;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Dependency_Checker extends Elementor_Test_Base {

	public function test_is_dependency_met_with_no_dependency() {
		// Arrange.
		$dependency = null;
		$props = [];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_dependency_met_with_empty_terms() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [],
		];
		$props = [];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_dependency_met_with_eq_operator_met() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [
				[
					'operator' => 'eq',
					'path' => [ 'position' ],
					'value' => 'absolute',
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'absolute',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_dependency_met_with_eq_operator_not_met() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [
				[
					'operator' => 'eq',
					'path' => [ 'position' ],
					'value' => 'absolute',
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'static',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_dependency_met_with_ne_operator_met() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [
				[
					'operator' => 'ne',
					'path' => [ 'position' ],
					'value' => 'static',
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'absolute',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_dependency_met_with_ne_operator_not_met() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [
				[
					'operator' => 'ne',
					'path' => [ 'position' ],
					'value' => 'static',
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'static',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_dependency_met_with_and_relation_all_met() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_AND,
			'terms' => [
				[
					'operator' => 'ne',
					'path' => [ 'position' ],
					'value' => 'static',
				],
				[
					'operator' => 'exists',
					'path' => [ 'position' ],
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'absolute',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_dependency_met_with_and_relation_not_all_met() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_AND,
			'terms' => [
				[
					'operator' => 'ne',
					'path' => [ 'position' ],
					'value' => 'static',
				],
				[
					'operator' => 'eq',
					'path' => [ 'display' ],
					'value' => 'flex',
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'absolute',
			],
			'display' => [
				'$$type' => 'string',
				'value' => 'block',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_dependency_met_with_or_relation_at_least_one_met() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [
				[
					'operator' => 'eq',
					'path' => [ 'position' ],
					'value' => 'absolute',
				],
				[
					'operator' => 'eq',
					'path' => [ 'position' ],
					'value' => 'relative',
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'absolute',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_dependency_met_with_or_relation_none_met() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [
				[
					'operator' => 'eq',
					'path' => [ 'position' ],
					'value' => 'absolute',
				],
				[
					'operator' => 'eq',
					'path' => [ 'position' ],
					'value' => 'relative',
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'static',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_extract_value_handles_transformable_prop_values() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [
				[
					'operator' => 'ne',
					'path' => [ 'position' ],
					'value' => 'static',
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'absolute',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_exists_operator_with_existing_value() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [
				[
					'operator' => 'exists',
					'path' => [ 'position' ],
				],
			],
		];
		$props = [
			'position' => [
				'$$type' => 'string',
				'value' => 'absolute',
			],
		];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_exists_operator_with_non_existing_value() {
		// Arrange.
		$dependency = [
			'relation' => Manager::RELATION_OR,
			'terms' => [
				[
					'operator' => 'exists',
					'path' => [ 'position' ],
				],
			],
		];
		$props = [];

		// Act.
		$result = Dependency_Checker::is_dependency_met( $dependency, $props );

		// Assert.
		$this->assertFalse( $result );
	}
}
