<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	function sanitize_text_field( $value ) {
		return is_string( $value ) ? trim( $value ) : $value;
	}
}

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Boolean_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Number_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Passthrough_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Size_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\String_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Interaction_Converter;
use PHPUnit\Framework\TestCase;

class Test_Interaction_Converter extends TestCase {

	private function make_plain_values_resolver(): Plain_Values_Resolver {
		$registry = new Plain_Resolvers_Registry();
		$registry->register_fallback( new Passthrough_Plain_Resolver() );
		$registry->register( String_Prop_Type::get_key(), new String_Plain_Resolver() );
		$registry->register( Number_Prop_Type::get_key(), new Number_Plain_Resolver() );
		$registry->register( Boolean_Prop_Type::get_key(), new Boolean_Plain_Resolver() );
		$registry->register( Size_Prop_Type::get_key(), new Size_Plain_Resolver() );

		return new Plain_Values_Resolver( $registry );
	}

	private function make_converter( ?bool $is_pro = true ): Interaction_Converter {
		return new Interaction_Converter( $is_pro, $this->make_plain_values_resolver() );
	}

	private function minimal_interaction( array $overrides = [] ): array {
		return array_merge(
			[
				'on' => 'load',
				'effect' => 'fade',
				'type' => 'in',
			],
			$overrides
		);
	}

	private function minimal_keyframes_envelope(): array {
		return [
			'$$type' => 'keyframes',
			'value' => [
				[
					'$$type' => 'keyframe-stop',
					'value' => [
						'stop' => [
							'$$type' => 'size',
							'value' => [
								'size' => 0,
								'unit' => Size_Constants::UNIT_PERCENT,
							],
						],
						'settings' => [
							'$$type' => 'keyframe-stop-settings',
							'value' => [
								'opacity' => [
									'$$type' => 'size',
									'value' => [
										'size' => 90,
										'unit' => '%',
									],
								],
							],
						],
					],
				],
			],
		];
	}

	public function test_convert__minimal_input_uses_defaults() {
		$converter = $this->make_converter( true );
		$result = $converter->convert( $this->minimal_interaction() );

		$this->assertEmpty( $result['rejected'] );
		$this->assertNotNull( $result['item'] );
		$this->assertSame( 'load', $result['item']['value']['trigger']['value'] );
		$this->assertSame( 600, $result['item']['value']['animation']['value']['timing_config']['value']['duration']['value']['size'] );
		$this->assertSame( 0, $result['item']['value']['animation']['value']['timing_config']['value']['delay']['value']['size'] );
		$this->assertSame( Presets::DEFAULT_EASING, $result['item']['value']['animation']['value']['config']['value']['easing']['value'] );
	}

	public function test_convert__unknown_key_is_ignored() {
		$converter = $this->make_converter( true );
		$result = $converter->convert( $this->minimal_interaction( [ 'foo' => 'bar' ] ) );

		$this->assertEmpty( $result['rejected'] );
		$this->assertNotNull( $result['item'] );
	}

	public function test_convert__invalid_enum_is_rejected() {
		$converter = $this->make_converter( true );
		$result = $converter->convert( $this->minimal_interaction( [ 'on' => 'not-a-trigger' ] ) );

		$this->assertNull( $result['item'] );
		$this->assertNotEmpty( $result['rejected'] );
		$this->assertStringContainsString( 'on:', $result['rejected'][0] );
	}

	public function test_convert__pro_only_trigger_rejected_when_pro_inactive() {
		$converter = $this->make_converter( false );
		$result = $converter->convert( $this->minimal_interaction( [ 'on' => 'hover' ] ) );

		$this->assertNull( $result['item'] );
		$this->assertStringContainsString( 'requires Elementor Pro', implode( ' ', $result['rejected'] ) );
	}

	public function test_convert__keyframes_rejected_when_effect_is_not_custom() {
		$converter = $this->make_converter( true );
		$result = $converter->convert( $this->minimal_interaction( [
			'keyframes' => $this->minimal_keyframes_envelope(),
		] ) );

		$this->assertNull( $result['item'] );
		$this->assertStringContainsString( 'keyframes: only allowed when effect is "custom"', implode( ' ', $result['rejected'] ) );
	}

	public function test_convert__keyframes_accepted_when_effect_is_custom() {
		$converter = $this->make_converter( true );
		$result = $converter->convert( $this->minimal_interaction( [
			'effect' => 'custom',
			'keyframes' => $this->minimal_keyframes_envelope(),
		] ) );

		$this->assertEmpty( $result['rejected'] );
		$this->assertNotNull( $result['item'] );
		$this->assertSame( 'custom-effect', $result['item']['value']['animation']['value']['custom_effect']['$$type'] );
	}

	public function test_convert__numeric_repeat_sets_times_mode() {
		$converter = $this->make_converter( true );
		$result = $converter->convert( $this->minimal_interaction( [ 'repeat' => 3 ] ) );

		$this->assertEmpty( $result['rejected'] );
		$this->assertSame( 'times', $result['item']['value']['animation']['value']['config']['value']['repeat']['value'] );
		$this->assertSame( 3, $result['item']['value']['animation']['value']['config']['value']['times']['value'] );
	}
}
