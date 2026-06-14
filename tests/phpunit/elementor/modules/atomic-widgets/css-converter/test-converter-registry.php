<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Registry_Converter extends Property_Converter_Base {
	private array $properties;

	public function __construct( array $properties ) {
		$this->properties = $properties;
	}

	protected function get_supported_properties(): array {
		return $this->properties;
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		return true;
	}
}

class Test_Converter_Registry extends TestCase {

	public function test_all__returns_registered_converters_in_order() {
		// Arrange.
		$registry = new Converter_Registry();
		$color = new Mock_Registry_Converter( [ 'color' ] );
		$width = new Mock_Registry_Converter( [ 'width' ] );

		// Act.
		$registry->register( $color )->register( $width );

		// Assert.
		$this->assertSame( [ $color, $width ], $registry->all() );
	}

	public function test_all__returns_empty_before_registration() {
		// Arrange.
		$registry = new Converter_Registry();

		// Act.
		$converters = $registry->all();

		// Assert.
		$this->assertSame( [], $converters );
	}
}
