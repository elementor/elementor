<?php

namespace Elementor\Testing\Modules\AtomicWidgets\ChildrenDependencies;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Children_Dependency_Evaluator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mirrors `evaluateTerm` / `isDependencyMet` from
 * `packages/packages/libs/editor-props/src/utils/prop-dependency-utils.ts`, so the
 * cases here intentionally overlap with `prop-dependency-utils.test.ts`.
 */
class Test_Children_Dependency_Evaluator extends TestCase {

	private function when( array $terms, string $relation = 'or' ): array {
		return [
			'relation' => $relation,
			'terms' => $terms,
		];
	}

	private function term( string $operator, array $path, $value ): array {
		return [
			'operator' => $operator,
			'path' => $path,
			'value' => $value,
		];
	}

	public function test_is_met__returns_true_when_when_is_null() {
		$this->assertTrue( Children_Dependency_Evaluator::is_met( null, [] ) );
	}

	public function test_is_met__returns_true_when_there_are_no_terms() {
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $this->when( [] ), [ 'flag' => false ] ) );
	}

	/**
	 * @dataProvider provide_operator_cases
	 */
	public function test_is_met__evaluates_operator( string $operator, $actual_value, $expected_value, bool $expected ) {
		// Arrange.
		$when = $this->when( [ $this->term( $operator, [ 'prop' ], $expected_value ) ] );
		$settings = [ 'prop' => $actual_value ];

		// Act.
		$result = Children_Dependency_Evaluator::is_met( $when, $settings );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function provide_operator_cases() {
		return [
			'eq matches' => [ 'eq', 'playing', 'playing', true ],
			'eq is strict about types' => [ 'eq', '1', 1, false ],
			'eq does not match' => [ 'eq', 'paused', 'playing', false ],
			'ne matches' => [ 'ne', false, true, true ],
			'ne does not match' => [ 'ne', true, true, false ],

			'gt matches' => [ 'gt', 5, 3, true ],
			'gt does not match' => [ 'gt', 3, 5, false ],
			'gt rejects non numeric' => [ 'gt', 'abc', 5, false ],
			'gte matches on equal' => [ 'gte', 5, 5, true ],
			'lt matches' => [ 'lt', 3, 5, true ],
			'lt rejects non numeric' => [ 'lt', 3, 'abc', false ],
			'lte matches on equal' => [ 'lte', 5, 5, true ],
			'lte does not match' => [ 'lte', 7, 5, false ],

			'in matches' => [ 'in', 'b', [ 'a', 'b' ], true ],
			'in does not match' => [ 'in', 'c', [ 'a', 'b' ], false ],
			'in rejects non array expected value' => [ 'in', 'a', 'a', false ],
			'nin matches' => [ 'nin', 'c', [ 'a', 'b' ], true ],
			'nin does not match' => [ 'nin', 'a', [ 'a', 'b' ], false ],

			'contains matches substring' => [ 'contains', 'background-video', 'video', true ],
			'contains does not match substring' => [ 'contains', 'background-video', 'image', false ],
			'contains matches array item' => [ 'contains', [ 'a', 'b' ], 'b', true ],
			'contains unwraps transformable array items' => [
				'contains',
				[ [ '$$type' => 'string', 'value' => 'b' ] ],
				'b',
				true,
			],
			'contains rejects incomparable values' => [ 'contains', 5, 'b', false ],
			'ncontains matches' => [ 'ncontains', 'background-video', 'image', true ],
			'ncontains rejects incomparable values' => [ 'ncontains', 5, 'b', false ],

			'exists matches truthy' => [ 'exists', 'test', null, true ],
			'exists matches zero' => [ 'exists', 0, null, true ],
			'exists matches false' => [ 'exists', false, null, true ],
			'exists does not match null' => [ 'exists', null, null, false ],
			'exists does not match empty string' => [ 'exists', '', null, false ],
			'not_exist matches null' => [ 'not_exist', null, null, true ],
			'not_exist does not match zero' => [ 'not_exist', 0, null, false ],
			'not_exist does not match string' => [ 'not_exist', 'test', null, false ],
		];
	}

	public function test_is_met__returns_true_for_unknown_operator() {
		// Arrange.
		$when = $this->when( [ $this->term( 'no_such_operator', [ 'prop' ], 'anything' ) ] );

		// Act & Assert.
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $when, [ 'prop' => 'value' ] ) );
	}

	public function test_is_met__treats_missing_path_as_null() {
		// Arrange.
		$exists = $this->when( [ $this->term( 'exists', [ 'missing' ], null ) ] );
		$not_exist = $this->when( [ $this->term( 'not_exist', [ 'missing' ], null ) ] );

		// Act & Assert.
		$this->assertFalse( Children_Dependency_Evaluator::is_met( $exists, [ 'prop' => 'value' ] ) );
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $not_exist, [ 'prop' => 'value' ] ) );
	}

	public function test_is_met__resolves_nested_paths() {
		// Arrange.
		$when = $this->when( [ $this->term( 'eq', [ 'video', 'src', 'id' ], 42 ) ] );
		$settings = [
			'video' => [
				'src' => [ 'id' => 42 ],
			],
		];

		// Act & Assert.
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $when, $settings ) );
	}

	public function test_is_met__returns_false_when_a_path_segment_is_not_traversable() {
		// Arrange.
		$when = $this->when( [ $this->term( 'eq', [ 'video', 'src' ], 'value' ) ] );

		// Act & Assert.
		$this->assertFalse( Children_Dependency_Evaluator::is_met( $when, [ 'video' => 'not-an-array' ] ) );
	}

	public function test_is_met__or_relation_requires_a_single_matching_term() {
		// Arrange.
		$terms = [
			$this->term( 'eq', [ 'a' ], 'no-match' ),
			$this->term( 'eq', [ 'b' ], 'match' ),
		];
		$settings = [ 'a' => 'other', 'b' => 'match' ];

		// Act & Assert.
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $this->when( $terms, 'or' ), $settings ) );
		$this->assertFalse( Children_Dependency_Evaluator::is_met( $this->when( $terms, 'and' ), $settings ) );
	}

	public function test_is_met__defaults_to_or_relation_when_none_is_given() {
		// Arrange.
		$when = [
			'terms' => [
				$this->term( 'eq', [ 'a' ], 'no-match' ),
				$this->term( 'eq', [ 'b' ], 'match' ),
			],
		];

		// Act & Assert.
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $when, [ 'a' => 'other', 'b' => 'match' ] ) );
	}

	public function test_is_met__and_relation_requires_all_terms_to_match() {
		// Arrange.
		$when = $this->when(
			[
				$this->term( 'eq', [ 'a' ], 'match' ),
				$this->term( 'ne', [ 'b' ], false ),
			],
			'and'
		);

		// Act & Assert.
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $when, [ 'a' => 'match', 'b' => true ] ) );
		$this->assertFalse( Children_Dependency_Evaluator::is_met( $when, [ 'a' => 'match', 'b' => false ] ) );
	}

	public function test_is_met__evaluates_nested_groups() {
		// Arrange: show_controls is truthy AND ( state is playing OR paused ).
		$when = $this->when(
			[
				$this->term( 'ne', [ 'show_controls' ], false ),
				$this->when(
					[
						$this->term( 'eq', [ 'state' ], 'playing' ),
						$this->term( 'eq', [ 'state' ], 'paused' ),
					],
					'or'
				),
			],
			'and'
		);

		// Act & Assert.
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $when, [ 'show_controls' => true, 'state' => 'paused' ] ) );
		$this->assertFalse( Children_Dependency_Evaluator::is_met( $when, [ 'show_controls' => true, 'state' => 'stopped' ] ) );
		$this->assertFalse( Children_Dependency_Evaluator::is_met( $when, [ 'show_controls' => false, 'state' => 'playing' ] ) );
	}

	public function test_is_met__matches_the_show_controls_rule_of_the_background_video_element() {
		// Arrange: the real rule is `show_controls ne false`, so an unset value keeps the controls.
		$when = $this->when( [ $this->term( 'ne', [ 'show_controls' ], false ) ] );

		// Act & Assert.
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $when, [ 'show_controls' => true ] ) );
		$this->assertTrue( Children_Dependency_Evaluator::is_met( $when, [] ) );
		$this->assertFalse( Children_Dependency_Evaluator::is_met( $when, [ 'show_controls' => false ] ) );
	}
}
