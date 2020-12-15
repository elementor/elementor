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
		$this->mock_module( new Collection( [
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
			'elementor-dev/elementor-dev.php' => [
				'Name' => 'elementor dev',
				Module::PLUGIN_VERSION_TESTED_HEADER => ''
			],
		] ) );

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
		$this->assertRegExp( '/extends elementor/', $result );
		$this->assertNotRegExp( '/patch version plugin/', $result );
		$this->assertNotRegExp( '/tested version plugin/', $result );
		$this->assertNotRegExp( '/regular plugins/', $result );
		$this->assertNotRegExp( '/header not exists plugin/', $result );
		$this->assertNotRegExp( '/elementor core/', $result );
		$this->assertNotRegExp( '/elementor dev/', $result );
	}

	/**
	 * @param Collection $plugins
	 *
	 * @return Module
	 */
	private function mock_module( Collection $plugins ) {
		$module = $this->getMockBuilder( Module::class )
			->setMethods( [ 'get_plugins', 'get_compatibility_tag_service' ] )
			->getMock();

		$module->method( 'get_plugins' )->willReturn( $plugins );
		$module->method( 'get_compatibility_tag_service' )->willReturn(
			$this->mock_compatibility_tag( $plugins )
		);

		/** @var Module $module */
		return $module;
	}

	/**
	 * @param Collection $plugins
	 *
	 * @return Compatibility_Tag
	 */
	private function mock_compatibility_tag( Collection $plugins ) {
		$service = $this->getMockBuilder( Compatibility_Tag::class )
			->setConstructorArgs( [ Module::PLUGIN_VERSION_TESTED_HEADER ] )
			->setMethods( [ 'get_plugins' ] )
			->getMock();

		$service->method( 'get_plugins' )->willReturn( $plugins->all() );

		/** @var Compatibility_Tag $service */
		return $service;
	}
}
