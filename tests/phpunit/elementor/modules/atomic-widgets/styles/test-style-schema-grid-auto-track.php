<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Style_Schema_Grid_Auto_Track extends TestCase {

	public function test_layout_schema_includes_grid_auto_rows_with_grid_auto_track_units() {
		// Arrange.
		$schema = Style_Schema::get_style_schema();

		// Act.
		$prop_type = $schema['grid-auto-rows'];

		// Assert.
		$this->assertInstanceOf( Size_Prop_Type::class, $prop_type );
		$this->assertSame(
			Size_Constants::grid_auto_track(),
			$prop_type->get_settings()['available_units']
		);
	}

	public function test_layout_schema_includes_grid_auto_columns_with_grid_auto_track_units() {
		// Arrange.
		$schema = Style_Schema::get_style_schema();

		// Act.
		$prop_type = $schema['grid-auto-columns'];

		// Assert.
		$this->assertInstanceOf( Size_Prop_Type::class, $prop_type );
		$this->assertSame(
			Size_Constants::grid_auto_track(),
			$prop_type->get_settings()['available_units']
		);
	}
}
