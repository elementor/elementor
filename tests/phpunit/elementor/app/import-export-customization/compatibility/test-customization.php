<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Compatibility;

use Elementor\App\Modules\ImportExportCustomization\Compatibility\Customization;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Customization extends Elementor_Test_Base {

	public function test_is_compatibility_needed__returns_true_for_old_version() {
		$manifest_data = [
			'version' => '2.0',
			'site-settings' => [ 'settings-global-colors', 'settings-general' ],
		];

		$this->assertTrue( Customization::is_compatibility_needed( $manifest_data, [] ) );
	}

	public function test_is_compatibility_needed__returns_true_for_missing_version() {
		$manifest_data = [
			'site-settings' => [ 'settings-global-colors', 'settings-general' ],
		];

		$this->assertTrue( Customization::is_compatibility_needed( $manifest_data, [] ) );
	}

	public function test_is_compatibility_needed__returns_false_for_current_version() {
		$manifest_data = [
			'version' => '3.0',
			'site-settings' => [
				'theme' => true,
				'globalColors' => true,
				'globalFonts' => true,
				'themeStyleSettings' => true,
				'generalSettings' => true,
				'experiments' => true,
			],
		];

		$this->assertFalse( Customization::is_compatibility_needed( $manifest_data, [] ) );
	}

	public function test_adapt_manifest__converts_old_format_to_new_format() {
		// Old format manifest
		$manifest_data = [
			'version' => '3.0',
			'site-settings' => [ 'settings-global-colors', 'settings-general', 'settings-experiments' ],
			'other-data' => 'should-remain',
		];

		$adapter = new Customization();
		$result = $adapter->adapt_manifest( $manifest_data );

		// Check version was updated
		$this->assertEquals( '3.0', $result['version'] );

		// Check site-settings was converted to new format
		$expected_site_settings = [
			'theme' => true,
			'globalColors' => true,
			'globalFonts' => true,
			'themeStyleSettings' => true,
			'generalSettings' => true,
			'experiments' => true,
		];
		$this->assertEquals( $expected_site_settings, $result['site-settings'] );

		// Check other data remains unchanged
		$this->assertEquals( 'should-remain', $result['other-data'] );
	}

	public function test_adapt_manifest__handles_empty_site_settings() {
		// Old format manifest with empty site-settings
		$manifest_data = [
			'version' => '3.0',
			'site-settings' => [],
		];

		$adapter = new Customization();
		$result = $adapter->adapt_manifest( $manifest_data );

		// Check site-settings are all false when empty
		$expected_site_settings = [
			'theme' => false,
			'globalColors' => false,
			'globalFonts' => false,
			'themeStyleSettings' => false,
			'generalSettings' => false,
			'experiments' => false,
		];
		$this->assertEquals( $expected_site_settings, $result['site-settings'] );
	}
}
