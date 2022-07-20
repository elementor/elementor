<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Force_Locale;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Force_Locale extends Elementor_Test_Base {

	public function test_force() {
		// Arrange.
		$force_locale = new Force_Locale( 'he_IL' );

		// Act.
		$force_locale->force();

		// Assert.
		$this->assertEquals( 'לחץ כאן', __( 'Click here', 'elementor' ) );

		// Cleanup.
		$force_locale->restore();
	}

	public function test_restore() {
		// Arrange.
		$force_locale = new Force_Locale( 'he_IL' );
		$force_locale->force();

		// Act.
		$force_locale->restore();

		// Assert.
		$this->assertEquals( 'Click here', __( 'Click here', 'elementor' ) );
	}
}
