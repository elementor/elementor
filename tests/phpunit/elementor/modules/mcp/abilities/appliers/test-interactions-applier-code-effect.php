<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( '__' ) ) {
	function __( $text, $domain = null ) {
		return $text;
	}
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	function sanitize_text_field( $value ) {
		return is_string( $value ) ? trim( $value ) : $value;
	}
}

if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $tag, $value ) {
		return $value;
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
use Elementor\Modules\Interactions\PlainResolvers\Code_Effect_Param_Plain_Resolver;
use Elementor\Modules\Interactions\Props\Code_Effect_Param_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\Interactions_Applier;
use PHPUnit\Framework\TestCase;

class Test_Interactions_Applier_Code_Effect extends TestCase {
	const SCROLL_REVEAL_CODE = "({ element, params, motion, reducedMotion }) => {\n\tconst { animate, inView } = motion;\n\tconst hidden = { opacity: 0, x: reducedMotion ? 0 : -params.distance };\n\tanimate( element, hidden, { duration: 0 } );\n\treturn inView( element, () => {\n\t\tanimate( element, { opacity: 1, x: 0 }, { duration: params.duration } );\n\t\treturn () => animate( element, hidden );\n\t} );\n}";

	const PULSE_DOTS_CODE = "({ element, params, motion, reducedMotion }) => {\n\tif ( reducedMotion ) {\n\t\treturn;\n\t}\n\tconst { animate, stagger } = motion;\n\tconst controls = animate( Array.from( element.children ), { scale: [ 1, params.scale, 1 ] }, { duration: 1.2, repeat: Infinity, delay: stagger( 0.15 ) } );\n\treturn () => controls.stop();\n}";

	const COLOR_CYCLE_CODE = "({ element, params, motion }) => {\n\tmotion.animate( element, { backgroundColor: [ params.from, params.to ] }, { duration: 2, repeat: Infinity } );\n}";

	private function make_applier( bool $can_save_code = true ): Interactions_Applier {
		$registry = new Plain_Resolvers_Registry();
		$registry->register_fallback( new Passthrough_Plain_Resolver() );
		$registry->register( String_Prop_Type::get_key(), new String_Plain_Resolver() );
		$registry->register( Number_Prop_Type::get_key(), new Number_Plain_Resolver() );
		$registry->register( Boolean_Prop_Type::get_key(), new Boolean_Plain_Resolver() );
		$registry->register( Size_Prop_Type::get_key(), new Size_Plain_Resolver() );
		$registry->register( Code_Effect_Param_Prop_Type::get_key(), new Code_Effect_Param_Plain_Resolver() );

		return new Interactions_Applier( new Plain_Values_Resolver( $registry ), fn() => $can_save_code );
	}

	private function code_item( string $code, array $params ): array {
		return [
			'animation' => [
				'effect' => 'code',
				'code_effect' => [
					'code' => $code,
					'params' => $params,
				],
			],
		];
	}

	private function scroll_reveal_params(): array {
		return [
			[ 'key' => 'distance', 'label' => 'Distance', 'control' => 'slider', 'value' => 100, 'default' => 100, 'min' => 0, 'max' => 400 ],
			[ 'key' => 'duration', 'label' => 'Duration', 'control' => 'number', 'value' => 0.9, 'default' => 0.9, 'min' => 0.1, 'max' => 5 ],
		];
	}

	private function apply( array $item, bool $can_save_code = true ): array {
		$index = [ 'hero' => [ 'widgetType' => 'e-div-block' ] ];
		$result = $this->make_applier( $can_save_code )->apply( $index, [ 'hero' => [ $item ] ] );

		return [ $index, array_column( $result['warnings']->all(), 'code' ) ];
	}

	public function test_apply__resolves_code_item_with_defaults_and_typed_params() {
		// Arrange
		$params = $this->scroll_reveal_params();
		$params[] = [ 'key' => 'accent', 'label' => 'Accent', 'control' => 'color', 'value' => '#6d28d9' ];
		$item = $this->code_item( str_replace( 'params.duration', 'params.duration, color: params.accent', self::SCROLL_REVEAL_CODE ), $params );

		// Act
		[ $index ] = $this->apply( $item );

		// Assert
		$item_value = $index['hero']['interactions']['items'][0]['value'];
		$animation = $item_value['animation']['value'];
		$resolved_params = $animation['code_effect']['value']['params']['value'];
		$this->assertSame( 'load', $item_value['trigger']['value'] );
		$this->assertSame( 'in', $animation['type']['value'] );
		$this->assertArrayHasKey( 'timing_config', $animation );
		$this->assertSame( 0.9, $resolved_params[1]['value']['value']['value'] );
		$this->assertSame( 'color', $resolved_params[2]['value']['value']['$$type'] );
	}

	public function test_apply__rejects_code_item_with_non_load_trigger() {
		// Arrange
		$item = $this->code_item( self::SCROLL_REVEAL_CODE, $this->scroll_reveal_params() );
		$item['trigger'] = 'scrollIn';

		// Act
		[ $index, $codes ] = $this->apply( $item );

		// Assert
		$this->assertSame( [ 'interaction_invalid' ], $codes );
		$this->assertArrayNotHasKey( 'interactions', $index['hero'] );
	}

	public function test_apply__good_patterns_have_no_warnings() {
		// Arrange
		$scroll_reveal = $this->code_item( self::SCROLL_REVEAL_CODE, $this->scroll_reveal_params() );
		$pulse_dots = $this->code_item( self::PULSE_DOTS_CODE, [
			[ 'key' => 'scale', 'label' => 'Scale', 'control' => 'slider', 'value' => 1.4, 'min' => 1, 'max' => 2 ],
		] );

		// Act
		[ , $scroll_reveal_codes ] = $this->apply( $scroll_reveal );
		[ , $pulse_dots_codes ] = $this->apply( $pulse_dots );

		// Assert
		$this->assertSame( [], $scroll_reveal_codes );
		$this->assertSame( [], $pulse_dots_codes );
	}

	public function test_apply__warns_when_user_cannot_save_code() {
		// Arrange
		$item = $this->code_item( self::SCROLL_REVEAL_CODE, $this->scroll_reveal_params() );

		// Act
		[ $index, $codes ] = $this->apply( $item, false );

		// Assert
		$this->assertSame( [ 'code_effect_stripped_on_save' ], $codes );
		$this->assertCount( 1, $index['hero']['interactions']['items'] );
	}

	public function test_apply__warns_on_paint_loop_without_cleanup() {
		// Arrange
		$item = $this->code_item( self::COLOR_CYCLE_CODE, [
			[ 'key' => 'from', 'label' => 'From', 'control' => 'color', 'value' => '#ff0000' ],
			[ 'key' => 'to', 'label' => 'To', 'control' => 'color', 'value' => '#0000ff' ],
		] );

		// Act
		[ , $codes ] = $this->apply( $item );

		// Assert
		$this->assertSame( [
			'code_effect_non_compositor_property',
			'code_effect_missing_cleanup',
			'code_effect_reduced_motion_ignored',
		], $codes );
	}

	public function test_apply__warns_on_global_access_and_import() {
		// Arrange
		$code = "({ element, motion }) => {\n\tconst box = document.querySelector( '.box' );\n\timport( 'motion' );\n\treturn () => motion.animate( box, { opacity: 1 } );\n}";

		// Act
		[ , $codes ] = $this->apply( $this->code_item( $code, [] ) );

		// Assert
		$this->assertSame( [ 'code_effect_global_access', 'code_effect_import_statement' ], $codes );
	}

	public function test_apply__warns_on_unused_param_but_accepts_destructuring() {
		// Arrange
		$code = "({ element, params, motion }) => {\n\tconst { distance } = params;\n\treturn motion.inView( element, () => { motion.animate( element, { x: distance } ); } );\n}";
		$params = $this->scroll_reveal_params();

		$index = [ 'hero' => [ 'widgetType' => 'e-div-block' ] ];

		// Act
		$result = $this->make_applier()->apply( $index, [ 'hero' => [ $this->code_item( $code, $params ) ] ] );

		// Assert
		$warnings = $result['warnings']->all();
		$this->assertSame( [ 'code_effect_unused_param' ], array_column( $warnings, 'code' ) );
		$this->assertStringContainsString( 'duration', $warnings[0]['message'] );
		$this->assertStringNotContainsString( 'distance', $warnings[0]['message'] );
	}
}
