<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Skill_Fixture_Example_Converter extends Property_Converter_Base {
	protected function get_supported_properties(): array {
		return [ 'letter-spacing' ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$context->set_prop(
			'letter-spacing',
			Size_Prop_Type::generate(
				[
					'size' => 2,
					'unit' => 'px',
				]
			)
		);

		return true;
	}
}

class Test_Skill_Fixture_Custom_Registry extends TestCase {

	public function test_private_css_converter_with_custom_registry() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Skill_Fixture_Example_Converter() );
		$converter = new Css_Converter( $registry, new Null_Failure_Reporter() );

		// Act.
		$result = $converter->convert( 'letter-spacing: 2px;' );

		// Assert.
		$this->assertArrayHasKey( 'letter-spacing', $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_core_import_pipeline_requires_factory_registration() {
		// Arrange.
		$converter = new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );

		// Act.
		$result = $converter->convert( 'letter-spacing: 2px;' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'letter-spacing: 2px;', $result['customCss'] );
	}
}
