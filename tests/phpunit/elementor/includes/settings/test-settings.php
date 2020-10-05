<?php
namespace Elementor\Tests\Phpunit\Includes\Settings;

use Elementor\Testing\Elementor_Test_Base;
use Elementor\Core\Files\CSS\Global_CSS;

class Test_Settings extends Elementor_Test_Base {

	public function test_clear_css_cache_on_update_css_settings() {
		$css_settings = [
			'elementor_disable_color_schemes',
			'elementor_disable_typography_schemes',
			'elementor_css_print_method',
			'elementor_optimized_dom_output',
		];

		foreach ( $css_settings as $option_name ) {
			$global_css = Global_CSS::create( 'global.css' );
			$global_css->update();

			$meta = $global_css->get_meta();

			$this->assertEquals( Global_CSS::CSS_STATUS_EMPTY, $meta['status'] );

			// Assert add_option.
			add_option ( $option_name, 'test_value' );
			$meta = $global_css->get_meta();
			$this->assertEquals( '', $meta['status'], 'global css should be empty after add option: ' . $option_name );

			// Assert update_option.
			update_option ( $option_name, 'another_test_value' );
			$meta = $global_css->get_meta();
			$this->assertEquals( '', $meta['status'], 'global css should be empty after update option: ' . $option_name );

			delete_option ( $option_name );
		}
	}
}
