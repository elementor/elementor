<?php

namespace Elementor\Modules\AtomicGlobalVariables\Classes;

use Elementor\Modules\AtomicGlobalVariables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use \PHPUnit\Framework\TestCase;

/**
 * @gorup Elementor\Modules
 * @group Elementor\Modules\AtomicGlobalVariables
 */
class Test_Style_Schema extends TestCase {
	private function style_schema() {
		return new Style_Schema();
	}

	public function test_augment__will_skip_regular_style_definitions() {
		// Arrange.
		$style_def = [
			'width' => Size_Prop_Type::make(),
			'height' => Size_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$this->assertEquals( $schema, $style_def );
	}

	public function test_augment__will_convert_color_prop_type() {
		// Arrange.
		$style_def = [
			'color' => Color_Prop_Type::make(),
			'width' => Size_Prop_Type::make(),
		];

		// Act.
		$schema = $this->style_schema()->augment( $style_def );

		// Assert.
		$expected = [
			'width' => Size_Prop_Type::make(),
			'color' => Union_Prop_Type::make()
				->add_prop_type( Color_Prop_Type::make() )
				->add_prop_type( Color_Variable_Prop_Type::make() ),
		];

		$this->assertEquals( $expected, $schema );
	}
}
