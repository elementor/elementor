<?php
namespace Elementor\Tests\Phpunit\Includes\Settings;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Files\CSS\Global_CSS;

class Test_Settings extends Elementor_Test_Base {

	public function test_clear_css_cache_on_update_css_settings() {
		$css_settings = [
			'elementor_disable_color_schemes',
			'elementor_disable_typography_schemes',
			'elementor_css_print_method',
		];

		foreach ( $css_settings as $option_name ) {
			$global_css = Global_CSS::create( 'global.css' );
			$global_css->update();

			$meta = $global_css->get_meta();

			$this->assertEquals( Global_CSS::CSS_STATUS_EMPTY, $meta['status'], $option_name );

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

	public function test_register_admin_menu() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		do_action( 'admin_menu' );

		// Assert.
		global $submenu;

		$elementor_menu = $submenu['elementor'];

		$expected_items = [
			'elementor' => 'Settings',
			'elementor-role-manager' => 'Role Manager',
			'elementor-tools' => 'Tools',
			'elementor-system-info' => 'System Info',
			'elementor-getting-started' => 'Getting Started',
			'go_knowledge_base_site' => 'Get Help',
			'e-form-submissions' => 'Submissions',
			'elementor_custom_fonts' => 'Custom Fonts',
			'elementor_custom_icons' => 'Custom Icons',
			'elementor_custom_custom_code' => 'Custom Code',
			'go_elementor_pro' => 'Upgrade',
		];

		$index = 0;

		foreach ( $expected_items as $expected_slug => $expected_label ) {
			$actual_label = $elementor_menu[ $index ][0];
			$actual_slug = $elementor_menu[ $index ][2];

			$this->assertEquals( $expected_label, $actual_label );
			$this->assertEquals( $expected_slug, $actual_slug );

			$index++;
		}
	}
}
