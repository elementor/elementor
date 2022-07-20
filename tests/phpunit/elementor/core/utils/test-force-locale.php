<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Force_Locale;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Force_Locale extends Elementor_Test_Base {

	public function teardown() {
		parent::teardown();

		// Cleanup.
		switch_to_locale( 'en_US' );
	}

	public function test_force() {
		// Arrange.
		$force_locale = new Force_Locale( 'he_IL' );

		// Act.
		$force_locale->force();

		// Assert.
		$this->assertEquals( 'לחץ כאן', __( 'Click here', 'elementor' ) );
	}

	public function test_reset() {
		// Arrange.
		$force_locale = new Force_Locale( 'he_IL' );
		$force_locale->force();

		// Act.
		$force_locale->reset();

		// Assert.
		$this->assertEquals( 'Click here', __( 'Click here', 'elementor' ) );
	}
}
