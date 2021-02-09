<?php
namespace Elementor\Testing\Modules\CompatibilityTag;

use Elementor\Core\Utils\Collection;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Modules\CompatibilityTag\Module;
use Elementor\Modules\CompatibilityTag\Compatibility_Tag;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	public function test_on_plugin_update_message() {
		$this->mock_wp_api( [
			'get_plugins' => new Collection( [
				'old' => [
					'Name' => 'old version plugin',
					Module::PLUGIN_VERSION_TESTED_HEADER => '2.9.0',
				],
				'invalid' => [
					'Name' => 'invalid version plugin',
					Module::PLUGIN_VERSION_TESTED_HEADER => 'a.b.10',
				],
				'patch' => [
					'Name' => 'patch version plugin',
					Module::PLUGIN_VERSION_TESTED_HEADER => '3.1.0',
				],
				'tested' => [
					'Name' => 'tested version plugin',
					Module::PLUGIN_VERSION_TESTED_HEADER => '3.1.5',
				],
				'not_exists' => [
					'Name' => 'header not exists plugin',
					Module::PLUGIN_VERSION_TESTED_HEADER => '',
				],
				'extends_elementor' => [
					'Name' => 'extends elementor',
					Module::PLUGIN_VERSION_TESTED_HEADER => '',
				],
				'regular' => [
					'Name' => 'regular plugins',
					Module::PLUGIN_VERSION_TESTED_HEADER => '',
				],
				'elementor/elementor.php' => [
					'Name' => 'elementor core',
					Module::PLUGIN_VERSION_TESTED_HEADER => ''
				],
				'elementor-beta/elementor-beta.php' => [
					'Name' => 'elementor beta',
					Module::PLUGIN_VERSION_TESTED_HEADER => ''
				],
			] ),
		] );

		new Module();

		// Act
		ob_start();
		do_action('in_plugin_update_message-' . ELEMENTOR_PLUGIN_BASE, [
			'new_version' => '3.1.5',
			'Version' => '3.0.0'
		] );

		$result = ob_get_clean();

		// Assert
		$this->assertRegExp( '/old version plugin/', $result );
		$this->assertRegExp( '/invalid version plugin/', $result );
		$this->assertNotRegExp( '/patch version plugin/', $result );
		$this->assertNotRegExp( '/tested version plugin/', $result );
		$this->assertNotRegExp( '/header not exists plugin/', $result );
		$this->assertRegExp( '/extends elementor/', $result );
		$this->assertNotRegExp( '/regular plugins/', $result );
		$this->assertNotRegExp( '/elementor core/', $result );
		$this->assertNotRegExp( '/elementor beta/', $result );
	}
}
