<?php

namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Modules\Components\Component_Overridable_Schema_Extender;
use Elementor\Modules\Components\PropTypes\Component_Overridable_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Overridable_Schema_Extender extends Elementor_Test_Base {

	public function set_up() {
		parent::set_up();
	}

	/**
	 * @dataProvider add_component_overridable_prop_type_data_provider
	 */
	public function test_get_extended_schema__adds_component_overridable_to_props( Prop_Type $prop ) {
		// Arrange
		$extender = Component_Overridable_Schema_Extender::make();

		// Act
		$schema = $extender->get_extended_schema( [
			'prop' => $prop
		] );

		// Assert
		$this->assertInstanceof( Union_Prop_Type::class, $schema['prop'] );
		$this->assertEquals( $prop->get_default(), $schema['prop']->get_default() );
		$this->assertEquals( [ $prop->get_key(), 'overridable' ], array_keys( $schema[ 'prop' ]->get_prop_types() ) );

        $union = $schema['prop'];
            
        $this->assertEquals( $prop, $union->get_prop_type( $prop->get_key() ) );
        $this->assertEquals( $prop, $union->get_prop_type( 'overridable' )->get_origin_prop_type() );
	}

	public function test_get_extended_schema__adds_recursively_to_object_types() {
		// Arrange
		$extender = Component_Overridable_Schema_Extender::make();

		$prop = new class extends Object_Prop_Type {
			public static function get_key(): string {
				return 'test-prop';
			}

			protected function define_shape(): array {
				return [
					'internal' => String_Prop_Type::make()->default( 'test' ),
				];
			}
		};

		// Act
		$schema = $extender->get_extended_schema( [
			'prop' => $prop
		] );

		// Assert
        // 'prop' is a union prop type, and it has two prop types: the original 'test-prop' and 'overridable'
		$this->assertInstanceof( Union_Prop_Type::class, $schema['prop'] );
		$this->assertEquals( [ 'test-prop', 'overridable' ], array_keys( $schema['prop']->get_prop_types() ));

        // 'overridable' has the original 'test-prop' prop type as its origin prop type
        $override_component_overridable_prop_type = $schema['prop']->get_prop_type( 'overridable' );
        $this->assertEquals( $prop, $override_component_overridable_prop_type->get_origin_prop_type() );

        $test_prop_prop_type = $schema['prop']->get_prop_type( 'test-prop' );
        $internal = $test_prop_prop_type->get_shape_field( 'internal' );

        // 'internal' is a union prop type, and it has two prop types: the original 'string' and 'overridable'
		$this->assertInstanceof( Union_Prop_Type::class, $internal );
        $this->assertEquals( [ 'string', 'overridable' ], array_keys( $internal->get_prop_types() ));

        // 'string' is the original string prop type, and it has the default value 'test'
        $internal_string_prop_type = $internal->get_prop_type( 'string' );
        $this->assertEquals( 'test', $internal_string_prop_type->get_default()[ 'value' ] );

        // 'overridable' has the original 'string' with default value 'test' prop type as its origin prop type
        $internal_component_overridable_prop_type = $internal->get_prop_type( 'overridable' );
        $this->assertEquals( String_Prop_Type::make()->default( 'test' ), $internal_component_overridable_prop_type->get_origin_prop_type() );
	}

	public function test_get_extended_schema__adds_to_existing_union_prop_type() {
		// Arrange
		$extender = Component_Overridable_Schema_Extender::make();

		$union_prop = Union_Prop_Type::make()
			->add_prop_type( String_Prop_Type::make() )
			->add_prop_type( Number_Prop_Type::make() )
			->default( String_Prop_Type::generate( 'test' ) );

		// Act
		$schema = $extender->get_extended_schema( [
			'prop' => $union_prop
		] );

		// Assert
		$this->assertInstanceof( Union_Prop_Type::class, $schema['prop'] );
		$this->assertInstanceof( 
			Component_Overridable_Prop_Type::class, 
			$schema['prop']->get_prop_type( Component_Overridable_Prop_Type::get_key() ) 
		);
		$this->assertInstanceof( 
			String_Prop_Type::class, 
			$schema['prop']->get_prop_type( String_Prop_Type::get_key() ) 
		);
		$this->assertInstanceof( 
			Number_Prop_Type::class, 
			$schema['prop']->get_prop_type( Number_Prop_Type::get_key() ) 
		);
        $this->assertEquals( String_Prop_Type::generate( 'test' ), $schema['prop']->get_default() );
	}

    public function test_get_extended_schema__skips_prop_types_that_ignore_component_overridable() {
		// Arrange
		$extender = Component_Overridable_Schema_Extender::make();

		$prop1 = String_Prop_Type::make()
			->meta( Component_Overridable_Prop_Type::ignore() )
			->default( 'default-value' );

		$prop2 = String_Prop_Type::make()
			->meta( Component_Overridable_Prop_Type::META_KEY, false )
			->default( 'default-value' );

		// Act
		$schema = $extender->get_extended_schema( [
			'prop1' => $prop1,
			'prop2' => $prop2,
		] );

		// Assert
		$this->assertSame( [ 'prop1' => $prop1, 'prop2' => $prop2 ], $schema );
	}

	public function add_component_overridable_prop_type_data_provider() {
		return [
			'string' => [
				String_Prop_Type::make()->default( 'test' ),
			],

			'number' => [
				Number_Prop_Type::make()->default( 0 ),
			],

			'image-src' => [
				Image_Src_Prop_Type::make(),
			],

			'url' => [
				Url_Prop_Type::make()->default( 'http://example.com' ),
			],
		];
	}
}

