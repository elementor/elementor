<?php
namespace Elementor\Tests\Phpunit\Includes\Settings;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Utils;

class Test_Settings extends Elementor_Test_Base {

	public function test_register_admin_menu() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		do_action( 'admin_menu' );

		// Assert.
		global $submenu;

		$elementor_menu = $submenu['elementor'];

		$expected_items = [
			'elementor' => 'Home',
			'elementor-settings' => 'Settings',
			'elementor-role-manager' => 'Role Manager',
			'elementor-element-manager' => 'Element Manager',
			'elementor-tools' => 'Tools',
			'elementor-system-info' => 'System Info',
			'elementor-getting-started' => 'Getting Started',
			'go_knowledge_base_site' => 'Get Help',
			'e-form-submissions' => 'Submissions',
			'elementor_custom_fonts' => 'Custom Fonts',
			'elementor_custom_icons' => 'Custom Icons',
			'elementor_custom_code' => 'Custom Code',
			'elementor-apps' => 'Add-ons',
			'go_elementor_pro' => Utils::is_sale_time() ? 'Upgrade Sale Now' : 'Upgrade',
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
