<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Types_Registry;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Prop_Types_Registry extends Elementor_Test_Base {

	public function test_register__throws_when_type_is_already_registered() {
		// Arrange.
		$registry = new Prop_Types_Registry();

		$registry->register( new String_Type() );

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Prop type with type `string` already exists' );

		// Act.
		$registry->register( new String_Type() );
	}

	public function test_register() {
		// Arrange.
		$registry = new Prop_Types_Registry();

		// Act.
		$registry->register( new String_Type() );

		// Assert.
		$this->assertInstanceOf( String_Type::class, $registry->get( 'string' ) );
	}

	public function test_get_all__is_serializable() {
		// Arrange.
		$registry = new Prop_Types_Registry();

		$registry->register( new class extends Prop_Type {
			public function get_type(): string {
				return 'type-1';
			}

			public function validate( $value ): void {}

			public function get_dynamic_categories(): array {
				return [ 'category-1', 'category-2' ];
			}
		} );

		$registry->register( new class extends Prop_Type {
			public function get_type(): string {
				return 'type-2';
			}

			public function validate( $value ): void {}

			public function get_dynamic_categories(): array {
				return [ 'category-3' ];
			}
		} );

		// Act.
		$serialized = json_encode( $registry->get_all() );

		// Assert.
		$this->assertJsonStringEqualsJsonString( '{
			"type-1": {
				"type": "type-1",
				"dynamic_categories": [ "category-1", "category-2" ]
			},
			"type-2": {
				"type": "type-2",
				"dynamic_categories": [ "category-3" ]
			}
		}', $serialized );
	}
}
