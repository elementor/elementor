<?php

use Elementor\Modules\Interactions\Props\Code_Effect_Params_Prop_Type;
use Elementor\Modules\Interactions\Props\Code_Prop_Type;
use Elementor\Modules\Interactions\Validators\Code_Effect_Value;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Validators
 */
class Test_Code_Effect_Value extends TestCase {
	const VALID_CODE = '({ element, params, motion }) => motion.animate( element, { x: params.distance } ).stop';

	public function test_is_valid__returns_true_when_effect_is_not_code() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'scrollIn', 'fade', null );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_valid__returns_true_for_code_effect_with_load_trigger() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( self::VALID_CODE, [ $this->number_param( 'distance', 100, 0, 400 ) ] ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_valid__returns_false_when_code_effect_trigger_is_not_load() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'hover', 'code', $this->code_effect( self::VALID_CODE ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_code_effect_missing() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'load', 'code', null );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_code_is_blank() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( '   ' ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_code_exceeds_max_length() {
		// Arrange.
		$code = str_repeat( 'a', Code_Prop_Type::MAX_LENGTH + 1 );
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( $code ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_param_value_type_does_not_match_control() {
		// Arrange.
		$param = $this->number_param( 'distance', 100, 0, 400 );
		$param['value']['value'] = [ '$$type' => 'string', 'value' => '100' ];
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( self::VALID_CODE, [ $param ] ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_number_param_is_out_of_range() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( self::VALID_CODE, [ $this->number_param( 'distance', 500, 0, 400 ) ] ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_select_value_is_not_an_option() {
		// Arrange.
		$param = $this->param( 'origin', 'select', [ '$$type' => 'string', 'value' => 'top' ] );
		$param['value']['options'] = [
			'$$type' => 'string-array',
			'value' => [
				[ '$$type' => 'string', 'value' => 'center' ],
				[ '$$type' => 'string', 'value' => 'first' ],
			],
		];
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( self::VALID_CODE, [ $param ] ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_true_for_color_and_switch_params() {
		// Arrange.
		$params = [
			$this->param( 'tint', 'color', [ '$$type' => 'color', 'value' => '#ff0088' ] ),
			$this->param( 'loop', 'switch', [ '$$type' => 'boolean', 'value' => true ] ),
		];
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( self::VALID_CODE, $params ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_valid__returns_false_when_param_key_is_not_an_identifier() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( self::VALID_CODE, [ $this->number_param( 'my-distance', 10, 0, 400 ) ] ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_param_keys_are_duplicated() {
		// Arrange.
		$params = [
			$this->number_param( 'distance', 10, 0, 400 ),
			$this->number_param( 'distance', 20, 0, 400 ),
		];
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( self::VALID_CODE, $params ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_params_exceed_max() {
		// Arrange.
		$params = array_map(
			fn( $index ) => $this->number_param( 'param_' . $index, 1, 0, 10 ),
			range( 0, Code_Effect_Params_Prop_Type::MAX_PARAMS )
		);
		$interaction_value = $this->interaction_value( 'load', 'code', $this->code_effect( self::VALID_CODE, $params ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	private function interaction_value( string $trigger, string $effect, ?array $code_effect ): array {
		$animation_value = [
			'effect' => [ '$$type' => 'string', 'value' => $effect ],
		];

		if ( null !== $code_effect ) {
			$animation_value['code_effect'] = $code_effect;
		}

		return [
			'trigger' => [ '$$type' => 'string', 'value' => $trigger ],
			'animation' => [
				'$$type' => 'animation-preset-props',
				'value' => $animation_value,
			],
		];
	}

	private function code_effect( string $code, array $params = [] ): array {
		$value = [
			'code' => [ '$$type' => 'code', 'value' => $code ],
		];

		if ( ! empty( $params ) ) {
			$value['params'] = [ '$$type' => 'code-effect-params', 'value' => $params ];
		}

		return [
			'$$type' => 'code-effect',
			'value' => $value,
		];
	}

	private function number_param( string $key, $value, $min, $max ): array {
		$param = $this->param( $key, 'slider', [ '$$type' => 'number', 'value' => $value ] );
		$param['value']['min'] = [ '$$type' => 'number', 'value' => $min ];
		$param['value']['max'] = [ '$$type' => 'number', 'value' => $max ];

		return $param;
	}

	private function param( string $key, string $control, array $value ): array {
		return [
			'$$type' => 'code-effect-param',
			'value' => [
				'key' => [ '$$type' => 'string', 'value' => $key ],
				'label' => [ '$$type' => 'string', 'value' => ucfirst( $key ) ],
				'control' => [ '$$type' => 'string', 'value' => $control ],
				'value' => $value,
			],
		];
	}
}
