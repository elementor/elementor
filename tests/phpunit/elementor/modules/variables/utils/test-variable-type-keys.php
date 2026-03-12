<?php

namespace Elementor\Testing\Modules\Variables\Utils;

use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Utils\Variable_Type_Keys;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Variable_Type_Keys extends Elementor_Test_Base {

	public function test_get_all_returns_all_variable_type_keys() {
		$keys = Variable_Type_Keys::get_all();

		$this->assertIsArray( $keys );
		$this->assertContains( Color_Variable_Prop_Type::get_key(), $keys );
		$this->assertContains( Font_Variable_Prop_Type::get_key(), $keys );
		$this->assertContains( Size_Variable_Prop_Type::get_key(), $keys );
		$this->assertContains( Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY, $keys );
		$this->assertCount( 4, $keys );
	}

	public function test_is_variable_type_returns_true_for_valid_types() {
		$this->assertTrue( Variable_Type_Keys::is_variable_type( Color_Variable_Prop_Type::get_key() ) );
		$this->assertTrue( Variable_Type_Keys::is_variable_type( Font_Variable_Prop_Type::get_key() ) );
		$this->assertTrue( Variable_Type_Keys::is_variable_type( Size_Variable_Prop_Type::get_key() ) );
		$this->assertTrue( Variable_Type_Keys::is_variable_type( Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY ) );
	}

	public function test_is_variable_type_returns_false_for_invalid_types() {
		$this->assertFalse( Variable_Type_Keys::is_variable_type( 'unknown-type' ) );
		$this->assertFalse( Variable_Type_Keys::is_variable_type( 'color' ) );
		$this->assertFalse( Variable_Type_Keys::is_variable_type( '' ) );
		$this->assertFalse( Variable_Type_Keys::is_variable_type( null ) );
	}

	public function test_get_resolved_type_returns_correct_mapping() {
		$this->assertSame( 'color', Variable_Type_Keys::get_resolved_type( Color_Variable_Prop_Type::get_key() ) );
		$this->assertSame( 'string', Variable_Type_Keys::get_resolved_type( Font_Variable_Prop_Type::get_key() ) );
		$this->assertSame( 'size', Variable_Type_Keys::get_resolved_type( Size_Variable_Prop_Type::get_key() ) );
		$this->assertSame( 'size', Variable_Type_Keys::get_resolved_type( Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY ) );
	}

	public function test_get_resolved_type_returns_null_for_unknown_type() {
		$this->assertNull( Variable_Type_Keys::get_resolved_type( 'unknown-type' ) );
		$this->assertNull( Variable_Type_Keys::get_resolved_type( '' ) );
	}

	public function test_get_type_mappings_returns_complete_map() {
		$mappings = Variable_Type_Keys::get_type_mappings();

		$this->assertIsArray( $mappings );
		$this->assertArrayHasKey( Color_Variable_Prop_Type::get_key(), $mappings );
		$this->assertArrayHasKey( Font_Variable_Prop_Type::get_key(), $mappings );
		$this->assertArrayHasKey( Size_Variable_Prop_Type::get_key(), $mappings );
		$this->assertArrayHasKey( Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY, $mappings );
	}
}
