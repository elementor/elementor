<?php

use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Interactions\Props\Code_Effect_Params_Prop_Type;
use Elementor\Modules\Interactions\Props\Code_Effect_Prop_Type;
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

	/**
	 * @dataProvider code_effect_triggers_provider
	 */
	public function test_is_valid__returns_true_for_code_effect_with_any_trigger( string $trigger ) {
		// Arrange.
		$interaction_value = $this->interaction_value( $trigger, 'code', $this->code_effect( self::VALID_CODE ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_valid__returns_true_for_named_code_effect() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'hover', 'code', $this->code_effect( self::VALID_CODE, [], 'Add class "is-active"' ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertTrue( $result );
	}

	/**
	 * @dataProvider invalid_names_provider
	 */
	public function test_is_valid__returns_false_for_invalid_name( string $name ) {
		// Arrange.
		$interaction_value = $this->interaction_value( 'hover', 'code', $this->code_effect( self::VALID_CODE, [], $name ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function invalid_names_provider(): array {
		return [
			'multiline' => [ "Add class\nis-active" ],
			'too long' => [ str_repeat( 'a', Code_Effect_Prop_Type::MAX_NAME_LENGTH + 1 ) ],
		];
	}

	public function code_effect_triggers_provider(): array {
		$triggers = array_diff( Presets::triggers_options(), [ Presets::EVENT_TRIGGER ] );

		return array_map( fn( $trigger ) => [ $trigger ], $triggers );
	}

	public function test_is_valid__returns_true_for_event_trigger_with_valid_event_name() {
		// Arrange.
		$interaction_value = $this->interaction_value( Presets::EVENT_TRIGGER, 'code', $this->code_effect( self::VALID_CODE ) );
		$interaction_value['event'] = [ '$$type' => 'string', 'value' => 'card-open' ];

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertTrue( $result );
	}

	/**
	 * @dataProvider invalid_event_names_provider
	 */
	public function test_is_valid__returns_false_for_event_trigger_with_missing_or_invalid_event_name( ?string $event_name ) {
		// Arrange.
		$interaction_value = $this->interaction_value( Presets::EVENT_TRIGGER, 'code', $this->code_effect( self::VALID_CODE ) );

		if ( null !== $event_name ) {
			$interaction_value['event'] = [ '$$type' => 'string', 'value' => $event_name ];
		}

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function invalid_event_names_provider(): array {
		return [
			'missing' => [ null ],
			'empty' => [ '' ],
			'uppercase' => [ 'CardOpen' ],
			'starts with digit' => [ '1-open' ],
			'too long' => [ 'a' . str_repeat( 'b', Presets::EVENT_NAME_MAX_LENGTH ) ],
		];
	}

	public function test_is_valid__returns_false_when_code_effect_trigger_is_unknown() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'swipe', 'code', $this->code_effect( self::VALID_CODE ) );

		// Act.
		$result = Code_Effect_Value::is_valid( $interaction_value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_valid__returns_false_when_preset_effect_uses_code_effect_only_trigger() {
		// Arrange.
		$interaction_value = $this->interaction_value( 'doubleClick', 'fade', null );

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

	private function code_effect( string $code, array $params = [], ?string $name = null ): array {
		$value = [
			'code' => [ '$$type' => 'code', 'value' => $code ],
		];

		if ( null !== $name ) {
			$value['name'] = [ '$$type' => 'string', 'value' => $name ];
		}

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
