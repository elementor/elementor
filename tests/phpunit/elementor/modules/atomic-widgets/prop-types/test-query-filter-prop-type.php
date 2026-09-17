<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Query_Filter_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Query_Filter_Prop_Type extends Elementor_Test_Base {

	public function test_shape_includes_key_values_and_taxonomies() {
		$prop_type = Query_Filter_Prop_Type::make();

		$shape = $prop_type->get_shape();

		$this->assertArrayHasKey( 'key', $shape );
		$this->assertArrayHasKey( 'values', $shape );
		$this->assertArrayHasKey( 'taxonomies', $shape );
	}

	public function test_validate_accepts_taxonomies_field() {
		$prop_type = Query_Filter_Prop_Type::make();

		$valid = $prop_type->validate( [
			'$$type' => 'query-filter',
			'value'  => [
				'key'        => [ '$$type' => 'string', 'value' => 'related_taxonomies' ],
				'values'     => null,
				'taxonomies' => [ '$$type' => 'string-array', 'value' => [
					[ '$$type' => 'string', 'value' => 'category' ],
				] ],
			],
		] );

		$this->assertTrue( $valid );
	}
}
