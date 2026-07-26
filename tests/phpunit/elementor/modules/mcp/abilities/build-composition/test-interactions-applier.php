<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( '__' ) ) {
	function __( $text, $domain = null ) {
		return $text;
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
use Elementor\Modules\Mcp\Abilities\Build_Composition\Interaction_Converter;
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

	private function make_applier( ?bool $is_experiment_active = true, ?Interaction_Converter $converter = null ): Interactions_Applier {
		$converter = $converter ?? new Interaction_Converter( true, $this->make_plain_values_resolver() );

		return new Interactions_Applier( $is_experiment_active, $converter );
	}

	private function valid_flat_interaction(): array {
		return [
			'on' => 'load',
			'effect' => 'fade',
			'type' => 'in',
			'for' => 600,
			'after' => 0,
		];
	}

	public function test_apply__empty_input_is_no_op() {
		$applier = $this->make_applier( true );
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [] );

		$this->assertNull( $result['error'] );
		$this->assertSame( [], $result['warnings'] );
		$this->assertArrayNotHasKey( 'interactions', $index['hero'] );
	}

	public function test_apply__unknown_config_id_is_skipped() {
		$applier = $this->make_applier( true );
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'missing' => [ $this->valid_flat_interaction() ],
		] );

		$this->assertNull( $result['error'] );
		$this->assertArrayNotHasKey( 'interactions', $index['hero'] );
	}

	public function test_apply__valid_flat_item_writes_interactions_to_node() {
		$applier = $this->make_applier( true );
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'hero' => [ $this->valid_flat_interaction() ],
		] );

		$this->assertNull( $result['error'] );
		$this->assertArrayHasKey( 'interactions', $index['hero'] );
		$this->assertSame( 1, $index['hero']['interactions']['version'] );
		$this->assertCount( 1, $index['hero']['interactions']['items'] );
		$this->assertSame( 'interaction-item', $index['hero']['interactions']['items'][0]['$$type'] );
		$this->assertSame( 'load', $index['hero']['interactions']['items'][0]['value']['trigger']['value'] );
	}

	public function test_apply__accepts_minimal_flat_input_without_timing() {
		$applier = $this->make_applier( true );
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'hero' => [
				[
					'on' => 'load',
					'effect' => 'fade',
					'type' => 'in',
				],
			],
		] );

		$this->assertNull( $result['error'] );
		$this->assertArrayHasKey( 'interactions', $index['hero'] );
	}

	public function test_apply__invalid_trigger_returns_error() {
		$converter = new Interaction_Converter( true, $this->make_plain_values_resolver() );
		$applier = new Interactions_Applier( true, $converter );
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$invalid = $this->valid_flat_interaction();
		$invalid['on'] = 'not-a-trigger';

		$result = $applier->apply( $index, [
			'hero' => [ $invalid ],
		] );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertSame( 'elementor_invalid_interactions', $result['error']->get_error_code() );
		$this->assertStringContainsString( '[hero]', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'elementor://interactions/schema', $result['error']->get_error_message() );
	}

	public function test_apply__inactive_experiment_returns_warning() {
		$applier = $this->make_applier( false );
		$index = [ 'hero' => [ 'widgetType' => 'e-heading' ] ];

		$result = $applier->apply( $index, [
			'hero' => [ $this->valid_flat_interaction() ],
		] );

		$this->assertNull( $result['error'] );
		$this->assertNotEmpty( $result['warnings'] );
		$this->assertArrayNotHasKey( 'interactions', $index['hero'] );
	}
}
