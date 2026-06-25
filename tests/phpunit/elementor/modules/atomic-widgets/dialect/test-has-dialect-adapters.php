<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Dialect;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Adapter_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Base_Dialect_Adapter;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Stub_Prop_Type_Adapter extends Base_Dialect_Adapter {
	public static function to_schema( Adapter_Context $ctx ) {
		return [ 'stub' => true ];
	}
}

class Stub_Prop_Type extends String_Prop_Type {
	public static function get_key(): string {
		return 'stub';
	}

	public static function define_default_dialects(): array {
		return [ 'test' => Stub_Prop_Type_Adapter::class ];
	}
}

class Test_Has_Dialect_Adapters extends TestCase {
	public function test_get_dialect_adapters_returns_built_in_dialect() {
		// Arrange
		$prop_type = Stub_Prop_Type::make();

		// Act
		$adapters = $prop_type->get_dialect_adapters();

		// Assert
		$this->assertSame( Stub_Prop_Type_Adapter::class, $adapters['test'] );
	}

	public function test_with_dialect_returns_same_instance() {
		// Arrange
		$prop_type = Stub_Prop_Type::make();

		// Act
		$result = $prop_type->with_dialect( 'noop', Base_Dialect_Adapter::class );

		// Assert
		$this->assertSame( $prop_type, $result );
	}
}
