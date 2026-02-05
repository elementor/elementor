<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Transition_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Transition_Transformer extends Elementor_Test_Base {

	private $transformer;

	public function setUp(): void {
		parent::setUp();

		$this->transformer = $this->getMockBuilder( Transition_Transformer::class )
			->onlyMethods( [ 'has_pro' ] )
			->getMock();

		$this->transformer->method( 'has_pro' )->willReturn( true );

		remove_all_filters( 'elementor/atomic-widgets/styles/transitions/allowed-properties' );
	}

	public function tearDown(): void {
		parent::tearDown();

		remove_all_filters( 'elementor/atomic-widgets/styles/transitions/allowed-properties' );
	}

	private function add_base_property_filter(): void {
		add_filter(
			'elementor/atomic-widgets/styles/transitions/allowed-properties',
			function( $properties ) {
				return array_merge( $properties, [ 'all' ] );
			}
		);
	}

	public function test_transform__returns_empty_when_pro_not_available() {
		// Arrange.
		$transformer = $this->getMockBuilder( Transition_Transformer::class )
			->onlyMethods( [ 'has_pro' ] )
			->getMock();

		$transformer->method( 'has_pro' )->willReturn( false );

		$this->add_base_property_filter();

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
		$result = $transformer->transform( $transitions, $context );

		// Assert.
		$this->assertSame( '', $result );
	}

	public function test_transform__property_all_is_allowed_when_filter_adds_it() {
		// Arrange.
		$this->add_base_property_filter();

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

	public function test_transform__only_allowed_properties_are_processed() {
		// Arrange.
		$this->add_base_property_filter();

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
				return array_merge( $properties, [ 'all', 'width', 'height', 'opacity' ] );
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
		$this->add_base_property_filter();

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
		// Arrange - no filter added, so no properties are allowed.
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

	public function test_transform__returns_empty_when_no_properties_allowed() {
		// Arrange - no filter, so default is empty array.
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
		$this->assertSame( '', $result );
	}
}
