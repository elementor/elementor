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

if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
		private $code;
		private $message;

		public function __construct( $code = '', $message = '', $data = '' ) {
			$this->code = $code;
			$this->message = $message;
		}

		public function get_error_code() {
			return $this->code;
		}

		public function get_error_message() {
			return $this->message;
		}
	}
}

if ( ! class_exists( 'WP_Http' ) ) {
	class WP_Http {
		const BAD_REQUEST = 400;
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
use Elementor\Modules\Mcp\Abilities\Build_Composition\Interactions_Applier;
use PHPUnit\Framework\TestCase;

class Test_Interactions_Applier extends TestCase {

	private function make_plain_values_resolver(): Plain_Values_Resolver {
		$registry = new Plain_Resolvers_Registry();
		$registry->register_fallback( new Passthrough_Plain_Resolver() );
		$registry->register( String_Prop_Type::get_key(), new String_Plain_Resolver() );
		$registry->register( Number_Prop_Type::get_key(), new Number_Plain_Resolver() );
		$registry->register( Boolean_Prop_Type::get_key(), new Boolean_Plain_Resolver() );
		$registry->register( Size_Prop_Type::get_key(), new Size_Plain_Resolver() );

		return new Plain_Values_Resolver( $registry );
	}

	private function make_applier( bool $is_experiment_active = true ): Interactions_Applier {
		return new Interactions_Applier( $is_experiment_active, $this->make_plain_values_resolver() );
	}

	private function valid_interaction(): array {
		return [
			'trigger' => 'load',
			'animation' => [
				'effect' => 'fade',
				'type' => 'in',
				'direction' => '',
				'timing_config' => [
					'duration' => [ 'size' => 600, 'unit' => 'ms' ],
					'delay'    => [ 'size' => 0,   'unit' => 'ms' ],
				],
				'config' => [
					'easing' => 'easeIn',
				],
			],
			'breakpoints' => [
				'excluded' => [],
			],
		];
	}

	public function test_apply__empty_input_is_no_op() {
		$applier = $this->make_applier();
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [] );

		$this->assertNull( $result['error'] );
		$this->assertSame( [], $result['warnings'] );
		$this->assertArrayNotHasKey( 'interactions', $index['hero'] );
	}

	public function test_apply__unknown_config_id_is_skipped() {
		$applier = $this->make_applier();
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'missing' => [ $this->valid_interaction() ],
		] );

		$this->assertNull( $result['error'] );
		$this->assertArrayNotHasKey( 'interactions', $index['hero'] );
	}

	public function test_apply__valid_item_writes_interactions_to_node() {
		$applier = $this->make_applier();
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'hero' => [ $this->valid_interaction() ],
		] );

		$this->assertNull( $result['error'] );
		$this->assertArrayHasKey( 'interactions', $index['hero'] );
		$this->assertSame( 1, $index['hero']['interactions']['version'] );
		$this->assertCount( 1, $index['hero']['interactions']['items'] );

		$item = $index['hero']['interactions']['items'][0];
		$this->assertSame( 'interaction-item', $item['$$type'] );
		$this->assertSame( 'load', $item['value']['trigger']['value'] );
		$this->assertSame( 'fade', $item['value']['animation']['value']['effect']['value'] );

		$duration = $item['value']['animation']['value']['timing_config']['value']['duration']['value'];
		$this->assertSame( 600, $duration['size'] );
		$this->assertSame( 'ms', $duration['unit'] );
	}

	public function test_apply__resolves_minimal_required_fields_only() {
		$applier = $this->make_applier();
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'hero' => [
				[
					'trigger' => 'load',
					'animation' => [
						'effect' => 'fade',
						'type' => 'in',
					],
				],
			],
		] );

		$this->assertNull( $result['error'] );
		$this->assertArrayHasKey( 'interactions', $index['hero'] );
	}

	public function test_apply__non_array_items_returns_error() {
		$applier = $this->make_applier();
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'hero' => 'not-an-array',
		] );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( '[hero] Interactions must be an array.', $result['error']->get_error_message() );
	}

	public function test_apply__non_object_item_returns_error() {
		$applier = $this->make_applier();
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'hero' => [ 'not-an-object' ],
		] );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( '[hero] Interaction at index 0 must be an object.', $result['error']->get_error_message() );
	}

	public function test_apply__unresolvable_item_returns_error() {
		$applier = $this->make_applier();
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'hero' => [
				[ 'unknown_field' => 'nope' ],
			],
		] );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertSame( 'elementor_invalid_interactions', $result['error']->get_error_code() );
		$this->assertStringContainsString( '[hero] Interaction at index 0 could not be resolved.', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'elementor://interactions/schema', $result['error']->get_error_message() );
	}

	public function test_apply__excluded_breakpoints_are_resolved() {
		$applier = $this->make_applier();
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$item = $this->valid_interaction();
		$item['breakpoints']['excluded'] = [ 'mobile', 'tablet' ];

		$result = $applier->apply( $index, [ 'hero' => [ $item ] ] );

		$this->assertNull( $result['error'] );
		$breakpoints = $index['hero']['interactions']['items'][0]['value']['breakpoints']['value'];
		$excluded = $breakpoints['excluded']['value'];
		$this->assertCount( 2, $excluded );
	}

	public function test_apply__enforces_max_interactions_per_element() {
		$applier = $this->make_applier();
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$items = array_fill( 0, Interactions_Applier::MAX_INTERACTIONS_PER_ELEMENT + 1, $this->valid_interaction() );

		$result = $applier->apply( $index, [ 'hero' => $items ] );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'Too many interactions', $result['error']->get_error_message() );
	}

	public function test_apply__inactive_experiment_returns_warning() {
		$applier = $this->make_applier( false );
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'hero' => [ $this->valid_interaction() ],
		] );

		$this->assertNull( $result['error'] );
		$this->assertNotEmpty( $result['warnings'] );
		$this->assertArrayNotHasKey( 'interactions', $index['hero'] );
	}
}
