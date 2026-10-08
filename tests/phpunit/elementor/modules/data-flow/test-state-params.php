<?php

use Elementor\Modules\DataFlow\Component_State_Params;
use Elementor\Modules\DataFlow\State_Params;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_State_Params extends TestCase {

	public function test_sanitize__keeps_valid_params_and_coerces_defaults() {
		// Arrange
		$params = [
			[ 'key' => 'count', 'label' => 'Count', 'type' => 'number', 'default' => '3', 'extra' => 'dropped' ],
			[ 'key' => 'open', 'type' => 'boolean', 'default' => 'true' ],
			[ 'key' => 'items', 'type' => 'json', 'default' => '[1,2]' ],
			[ 'key' => 'title', 'type' => 'string', 'default' => [ 'not', 'a', 'string' ] ],
			[ 'key' => 'bad key', 'type' => 'string' ],
			[ 'key' => 'no_type' ],
			[ 'key' => 'unknown_type', 'type' => 'date' ],
			'not-an-array',
		];

		// Act
		$result = State_Params::sanitize( $params );

		// Assert
		$this->assertSame( [
			[ 'key' => 'count', 'label' => 'Count', 'type' => 'number', 'default' => 3 ],
			[ 'key' => 'open', 'label' => 'open', 'type' => 'boolean', 'default' => true ],
			[ 'key' => 'items', 'label' => 'items', 'type' => 'json', 'default' => [ 1, 2 ] ],
			[ 'key' => 'title', 'label' => 'title', 'type' => 'string', 'default' => '' ],
		], $result );
	}

	public function test_sanitize__decodes_json_strings_dedupes_keys_and_caps_the_list() {
		// Arrange
		$params = array_map( fn( $index ) => [
			'key' => 'key_' . $index,
			'type' => 'number',
			'default' => $index,
		], range( 1, State_Params::MAX_PARAMS + 5 ) );
		array_unshift( $params, [ 'key' => 'key_1', 'type' => 'string', 'default' => 'first' ] );

		// Act
		$result = State_Params::sanitize( json_encode( $params ) );

		// Assert
		$this->assertCount( State_Params::MAX_PARAMS, $result );
		$this->assertSame( [ 'key' => 'key_1', 'label' => 'key_1', 'type' => 'string', 'default' => 'first' ], $result[0] );
	}

	public function test_sanitize__keeps_parent_bindings_as_defaults() {
		// Arrange
		$params = [ [ 'key' => 'start', 'type' => 'number', 'default' => '{{ state.initial }}' ] ];

		// Act
		$result = State_Params::sanitize( $params );

		// Assert
		$this->assertSame( '{{ state.initial }}', $result[0]['default'] );
	}

	public function test_coerce__converts_compatible_values_and_rejects_mismatches() {
		// Act & Assert
		$this->assertSame( [ true, 5 ], $this->coerce( '5', 'number' ) );
		$this->assertSame( [ true, 1.5 ], $this->coerce( 1.5, 'number' ) );
		$this->assertSame( [ false, null ], $this->coerce( 'five', 'number' ) );
		$this->assertSame( [ false, null ], $this->coerce( true, 'number' ) );
		$this->assertSame( [ true, false ], $this->coerce( 'false', 'boolean' ) );
		$this->assertSame( [ true, true ], $this->coerce( 1, 'boolean' ) );
		$this->assertSame( [ false, null ], $this->coerce( 'yes', 'boolean' ) );
		$this->assertSame( [ true, '7' ], $this->coerce( 7, 'string' ) );
		$this->assertSame( [ false, null ], $this->coerce( [ 'a' ], 'string' ) );
		$this->assertSame( [ true, [ 'a' => 1 ] ], $this->coerce( '{"a":1}', 'json' ) );
		$this->assertSame( [ true, [ 'a' => 1 ] ], $this->coerce( [ 'a' => 1 ], 'json' ) );
		$this->assertSame( [ false, null ], $this->coerce( '{not json', 'json' ) );
	}

	public function test_resolve__builds_state_and_resolves_parent_bindings() {
		// Arrange
		$params = State_Params::sanitize( [
			[ 'key' => 'count', 'type' => 'number', 'default' => '{{state.start}}' ],
			[ 'key' => 'title', 'type' => 'string', 'default' => '{{state.page.title}}' ],
			[ 'key' => 'missing', 'type' => 'number', 'default' => '{{state.nope}}' ],
			[ 'key' => 'open', 'type' => 'boolean', 'default' => false ],
		] );
		$parent_state = [
			'start' => '10',
			'page' => [ 'title' => 'Home' ],
		];

		// Act
		$state = State_Params::resolve( $params, $parent_state );

		// Assert
		$this->assertSame( [
			'count' => 10,
			'title' => 'Home',
			'missing' => 0,
			'open' => false,
		], $state );
	}

	public function test_resolve__bindings_can_read_earlier_params_of_the_same_scope() {
		// Arrange
		$params = State_Params::apply_values( State_Params::sanitize( [
			[ 'key' => 'start', 'type' => 'number', 'default' => 0 ],
			[ 'key' => 'count', 'type' => 'number', 'default' => '{{state.start}}' ],
		] ), [ 'start' => 10 ] )['params'];

		// Act
		$state = State_Params::resolve( $params, [ 'start' => 99 ] );

		// Assert
		$this->assertSame( [ 'start' => 10, 'count' => 10 ], $state );
	}

	public function test_apply_values__overrides_declared_defaults_and_reports_unknown_and_invalid_keys() {
		// Arrange
		$params = State_Params::sanitize( [
			[ 'key' => 'start', 'type' => 'number', 'default' => 0 ],
			[ 'key' => 'label', 'type' => 'string', 'default' => 'Count' ],
			[ 'key' => 'open', 'type' => 'boolean', 'default' => false ],
		] );
		$values = [
			'start' => '5',
			'label' => '{{state.page_label}}',
			'open' => 'maybe',
			'ghost' => 1,
		];

		// Act
		$result = State_Params::apply_values( $params, $values );

		// Assert
		$this->assertSame( [ 5, '{{state.page_label}}', false ], array_column( $result['params'], 'default' ) );
		$this->assertSame( [ 'ghost' ], $result['unknown_keys'] );
		$this->assertSame( [ 'open' ], $result['invalid_keys'] );
	}

	public function test_sanitize_values__keeps_an_object_of_valid_keys() {
		// Arrange
		$values = [
			'start' => 5,
			'bad key' => 1,
			'items' => [ 1, 2 ],
		];

		// Act
		$result = State_Params::sanitize_values( $values );
		$list_result = State_Params::sanitize_values( [ 1, 2 ] );

		// Assert
		$this->assertSame( [ 'start' => 5, 'items' => [ 1, 2 ] ], $result );
		$this->assertSame( [], $list_result );
	}

	public function test_merge_roots__first_root_wins_on_duplicate_keys() {
		// Arrange
		$first_root = State_Params::sanitize( [ [ 'key' => 'start', 'type' => 'number', 'default' => 1 ] ] );
		$second_root = State_Params::sanitize( [
			[ 'key' => 'start', 'type' => 'number', 'default' => 2 ],
			[ 'key' => 'title', 'type' => 'string', 'default' => 'Hi' ],
		] );

		// Act
		$result = State_Params::merge_roots( [ $first_root, $second_root ] );

		// Assert
		$this->assertSame( [ 1, 'Hi' ], array_column( $result['params'], 'default' ) );
		$this->assertSame( [ 'start' ], $result['duplicate_keys'] );
	}

	public function test_component_from_elements__merges_root_params() {
		// Arrange
		$root_elements = [
			[ 'id' => 'root1', State_Params::DATA_KEY => [ [ 'key' => 'start', 'type' => 'number', 'default' => 1 ] ] ],
			[ 'id' => 'root2' ],
			[ 'id' => 'root3', State_Params::DATA_KEY => [ [ 'key' => 'start', 'type' => 'string' ] ] ],
		];

		// Act
		$result = Component_State_Params::from_elements( $root_elements );

		// Assert
		$this->assertSame( [ [ 'key' => 'start', 'label' => 'start', 'type' => 'number', 'default' => 1 ] ], $result['params'] );
		$this->assertSame( [ 'start' ], $result['duplicate_keys'] );
	}

	private function coerce( $value, string $type ): array {
		$coerced = null;
		$is_valid = State_Params::coerce( $value, $type, $coerced );

		return [ $is_valid, $coerced ];
	}
}
