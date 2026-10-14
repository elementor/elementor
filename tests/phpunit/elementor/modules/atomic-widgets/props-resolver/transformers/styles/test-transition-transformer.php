<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Transition_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Transition_Transformer extends Elementor_Test_Base {

	private Transition_Transformer $transformer;

	public function setUp(): void {
		parent::setUp();

		$this->transformer = new Transition_Transformer();
		remove_all_filters( 'elementor/atomic-widgets/styles/transitions/allowed-properties' );
	}

	public function tearDown(): void {
		parent::tearDown();

		remove_all_filters( 'elementor/atomic-widgets/styles/transitions/allowed-properties' );
	}

	public function test_transform__core_property_all_is_allowed() {
		// Arrange.
		$transitions = [
			[
				'selection' => [
					'value' => 'all',
				],
				'size' => '200ms',
			],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $transitions, $context );

		// Assert.
		$this->assertSame( 'all 200ms', $result );
	}

	public function test_transform__core_property_only_allows_core_properties() {
		// Arrange.
		$transitions = [
			[
				'selection' => [
					'value' => 'all',
				],
				'size' => '200ms',
			],
			[
				'selection' => [
					'value' => 'width',
				],
				'size' => '300ms',
			],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $transitions, $context );

		// Assert.
		$this->assertSame( 'all 200ms', $result );
	}

	public function test_transform__filter_can_extend_allowed_properties() {
		// Arrange.
		add_filter(
			'elementor/atomic-widgets/styles/transitions/allowed-properties',
			function( $properties ) {
				return array_merge( $properties, [ 'width', 'height', 'opacity' ] );
			}
		);

		$transitions = [
			[
				'selection' => [
					'value' => 'all',
				],
				'size' => '200ms',
			],
			[
				'selection' => [
					'value' => 'width',
				],
				'size' => '300ms',
			],
			[
				'selection' => [
					'value' => 'height',
				],
				'size' => '400ms',
			],
			[
				'selection' => [
					'value' => 'invalid-property',
				],
				'size' => '500ms',
			],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $transitions, $context );

		// Assert.
		$this->assertSame( 'all 200ms, width 300ms, height 400ms', $result );
	}

	public function test_transform__empty_selection_value_returns_empty_string() {
		// Arrange.
		$transitions = [
			[
				'selection' => [
					'value' => '',
				],
				'size' => '200ms',
			],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $transitions, $context );

		// Assert.
		$this->assertSame( '', $result );
	}

	public function test_transform__all_transitions_filtered_out_returns_empty_string() {
		// Arrange.
		$transitions = [
			[
				'selection' => [
					'value' => 'invalid-property-1',
				],
				'size' => '200ms',
			],
			[
				'selection' => [
					'value' => 'invalid-property-2',
				],
				'size' => '300ms',
			],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $transitions, $context );

		// Assert.
		$this->assertSame( '', $result );
	}
}

