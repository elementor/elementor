<?php

namespace Elementor\Tests\Phpunit\Swiper;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\Swiper\Module as Swiper_Module;

class Test_Swiper extends Elementor_Test_Base {
	public function test__swiper_exp_to_settings_conversion() {
//		$this->swiper_exp_to_settings_conversion( 'inactive', '5.3.6' );
		$this->swiper_exp_to_settings_conversion( 'active', '8.4.5' );
	}

	public function swiper_exp_to_settings_conversion( $old_value, $expected_value ) {
		// Arrange
		update_option( 'elementor_experiment-e_swiper_latest', $old_value );
		// Act
		Swiper_Module::swiper_experiment_converter();

		// Assert
		$this->assertEquals( $expected_value, get_option( 'elementor_swiper_active_version' ) );
		delete_option( 'elementor_swiper_active_version' );
		delete_option( 'elementor_experiment-e_swiper_latest' );

	}
}
