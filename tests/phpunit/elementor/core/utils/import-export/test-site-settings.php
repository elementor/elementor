<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Site_Settings;

use Elementor\App\Modules\ImportExport\Utils;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Plugin;

class Test_Site_Settings extends Elementor_Test_Base {
	public function test_update_kit_site_settings_space_between_widgets () {
		// Arrange
		$site_settings = [
			'space_between_widgets' => [
				'unit' => 'px',
				'size' => 32,
				'sizes' => [],
			],
		];

		// Act
		$site_settings['space_between_widgets'] = Utils::update_space_between_widgets_values( $site_settings['space_between_widgets'] );

		// Assert
		$this->assertArrayHasKey( 'row', $site_settings['space_between_widgets'] );
		$this->assertArrayHasKey( 'column', $site_settings['space_between_widgets'] );
		$this->assertArrayHasKey( 'isLinked', $site_settings['space_between_widgets'] );
		$this->assertEquals( '32', $site_settings['space_between_widgets']['row'] );
		$this->assertEquals( '32', $site_settings['space_between_widgets']['column'] );
		$this->assertTrue( $site_settings['space_between_widgets']['isLinked'] );
	}
}
