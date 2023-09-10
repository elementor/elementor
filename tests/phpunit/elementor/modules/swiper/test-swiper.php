<?php
namespace Elementor\Tests\Phpunit\Swiper;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\Swiper\Module as Swiper_Module;

class Test_Swiper extends Elementor_Test_Base {
	public function test__swiper_exp_to_settings_conversion__inactive() {
		// Arrange
		update_option( 'elementor_experiment-e_swiper_latest', 'inactive' );

		// Act
		Swiper_Module::swiper_experiment_convertor();

		// Assert
		$this->assertEquals( '5.3.6', get_option( 'elementor_swiper_active_version' ) );
	}

	public function test__swiper_exp_to_settings_conversion__active() {
		// Arrange
		update_option( 'elementor_experiment-e_swiper_latest', 'active' );

		// Act
		Swiper_Module::swiper_experiment_convertor();

		// Assert
		$this->assertEquals( '8.4.5', get_option( 'elementor_swiper_active_version' ) );
	}

	public function test__swiper_exp_to_settings_conversion__empty() {
		// Arrange
		delete_option( 'elementor_experiment-e_swiper_latest' );

		// Act
		Swiper_Module::swiper_experiment_convertor();

		// Assert
		$this->assertEquals( '5.3.6', get_option( 'elementor_swiper_active_version' ) );
	}
}
