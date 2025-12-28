<?php

namespace Elementor\Testing\Modules\Components\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\Components\Transformers\Component_Instance_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;
use ReflectionClass;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Instance_Transformer extends Elementor_Test_Base {
	private function reset_rendering_stack(): void {
		$reflection = new ReflectionClass( Component_Instance_Transformer::class );
		$property = $reflection->getProperty( 'rendering_stack' );
		$property->setAccessible( true );
		$property->setValue( null, [] );
	}

	public function setUp(): void {
		parent::setUp();
		$this->reset_rendering_stack();
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->reset_rendering_stack();
	}

	public function test_transform__detects_circular_reference_and_returns_placeholder() {
		// Arrange
		$transformer = new Component_Instance_Transformer();
		$component_id = 123;

		$reflection = new ReflectionClass( Component_Instance_Transformer::class );
		$property = $reflection->getProperty( 'rendering_stack' );
		$property->setAccessible( true );
		$property->setValue( null, [ $component_id ] );

		$value = [ 'component_id' => $component_id ];

		// Act
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert
		$this->assertStringContainsString( 'Circular component reference detected', $result );
	}

	public function test_transform__allows_rendering_when_no_circular_reference() {
		// Arrange
		$transformer = new Component_Instance_Transformer();
		$value = [ 'component_id' => 999 ];

		// Act
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert
		$this->assertStringNotContainsString( 'Circular component reference detected', $result );
	}

	public function test_transform__cleans_up_rendering_stack_after_transform() {
		// Arrange
		$transformer = new Component_Instance_Transformer();
		$component_id = 456;
		$value = [ 'component_id' => $component_id ];

		// Act
		$transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert
		$reflection = new ReflectionClass( Component_Instance_Transformer::class );
		$property = $reflection->getProperty( 'rendering_stack' );
		$property->setAccessible( true );
		$stack = $property->getValue( null );

		$this->assertNotContains( $component_id, $stack );
	}

	public function test_transform__allows_same_component_after_previous_render_completes() {
		// Arrange
		$transformer = new Component_Instance_Transformer();
		$component_id = 789;
		$value = [ 'component_id' => $component_id ];

		// Act
		$result1 = $transformer->transform( $value, Props_Resolver_Context::make() );
		$result2 = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert
		$this->assertStringNotContainsString( 'Circular component reference detected', $result1 );
		$this->assertStringNotContainsString( 'Circular component reference detected', $result2 );
	}
}

