<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Menu_Config;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Menu_Config extends PHPUnit_TestCase {

	public function test_is_wp_one_package_available__returns_true_when_package_exists() {
		if ( ! class_exists( '\ElementorOne\Loader' ) ) {
			$this->markTestSkipped( 'ElementorOne\Loader class not available' );
		}

		$result = Menu_Config::is_wp_one_package_available();

		$this->assertTrue( $result );
	}

	public function test_get_excluded_level4_slugs__returns_array() {
		$result = Menu_Config::get_excluded_level4_slugs();

		$this->assertIsArray( $result );
	}

	public function test_get_excluded_level3_slugs__returns_array() {
		$result = Menu_Config::get_excluded_level3_slugs();

		$this->assertIsArray( $result );
	}

	public function test_get_legacy_slug_mapping__returns_array() {
		$result = Menu_Config::get_legacy_slug_mapping();

		$this->assertIsArray( $result );
	}

	public function test_get_legacy_pro_mapping__returns_array() {
		$result = Menu_Config::get_legacy_pro_mapping();

		$this->assertIsArray( $result );
	}

	public function test_get_attribute_mapping__returns_array() {
		$result = Menu_Config::get_attribute_mapping();

		$this->assertIsArray( $result );
	}

	public function test_get_elementor_home_url__returns_valid_url() {
		$result = Menu_Config::get_elementor_home_url();

		$this->assertStringContainsString( 'admin.php?page=elementor', $result );
	}

	public function test_get_elementor_post_types__returns_array() {
		$result = Menu_Config::get_elementor_post_types();

		$this->assertIsArray( $result );
	}
}
