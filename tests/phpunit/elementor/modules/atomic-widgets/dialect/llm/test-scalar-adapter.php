<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Dialect\Llm;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Base_Dialect_Adapter;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Dialect_Walker;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Stub_Object_For_Scalar extends Object_Prop_Type {
	public static function get_key(): string {
		return 'stub-object-for-scalar';
	}

	protected function define_shape(): array {
		return [];
	}
}

class Test_Scalar_Adapter extends TestCase {
	public function test_llm_schema_for_scalar_props() {
		// Arrange
		$root = Stub_Object_For_Scalar::make()->set_shape( [
			'title'    => String_Prop_Type::make()->description( 'The heading text' )->meta( 'llm_instructions', 'Keep it short' ),
			'count'    => Number_Prop_Type::make()->meta( 'examples', 42 ),
			'enabled'  => Boolean_Prop_Type::make()->meta( 'examples', [ true, false ] ),
			'passthru' => String_Prop_Type::make()->with_dialect( 'llm', Base_Dialect_Adapter::class ),
		] );

		// Act
		$schema = Dialect_Walker::to_schema( $root, 'llm' );

		// Assert
		$this->assertSame( [ 'type' => 'string', 'description' => 'The heading text', 'llm_instructions' => 'Keep it short' ], $schema['title'] );
		$this->assertSame( [ 'type' => 'number', 'examples' => [ 42 ] ], $schema['count'] );
		$this->assertSame( [ 'type' => 'boolean', 'examples' => [ true, false ] ], $schema['enabled'] );
		$this->assertSame( [], $schema['passthru'] );
	}

	public function test_enum_prop_outputs_enum_instead_of_type() {
		// Arrange
		$root = Stub_Object_For_Scalar::make()->set_shape( [
			'tag' => String_Prop_Type::make()->enum( [ 'h1', 'h2', 'h3' ] ),
		] );

		// Act
		$schema = Dialect_Walker::to_schema( $root, 'llm' );

		// Assert
		$this->assertSame( [ 'enum' => [ 'h1', 'h2', 'h3' ] ], $schema['tag'] );
		$this->assertArrayNotHasKey( 'type', $schema['tag'] );
	}
}
