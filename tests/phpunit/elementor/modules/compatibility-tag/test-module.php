<?php
namespace Elementor\Testing\Modules\CompatibilityTag;

use Elementor\Testing\Elementor_Test_Base;
use Elementor\Modules\CompatibilityTag\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	public function test_in_plugin_update_message() {
		// Arrange
		$module = $this->getMockBuilder(Module::class)
			->setMethods( [ 'get_plugins' ] )
			->getMock();

		$module->method( 'get_plugins' )->willReturn([
			[
				'Name' => 'old version plugin',
				Module::ELEMENTOR_VERSION_TESTED_HEADER => '2.9.0',
			],
			[
				'Name' => 'invalid version plugin',
				Module::ELEMENTOR_VERSION_TESTED_HEADER => 'a.b.10',
			],
			[
				'Name' => 'patch version plugin',
				Module::ELEMENTOR_VERSION_TESTED_HEADER => '3.1.0',
			],
			[
				'Name' => 'tested version plugin',
				Module::ELEMENTOR_VERSION_TESTED_HEADER => '3.1.5',
			]
		]);

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
		$this->assertRegExp( '/a\.b\.10 \(Invalid version\)/', $result, 'it should add "(Invalid version)" to the version text' );
	}

	public function test_in_plugin_update_message__should_not_check_for_untested_plugins_on_patch_update() {
		// Arrange
		$module = $this->getMockBuilder(Module::class)
			->setMethods( [ 'get_plugins' ] )
			->getMock();

		$module->method( 'get_plugins' )->willReturn([
			[
				'Name' => 'old version test plugin',
				Module::ELEMENTOR_VERSION_TESTED_HEADER => '2.9.0',
			],
		]);

		// Act
		ob_start();
		do_action('in_plugin_update_message-' . ELEMENTOR_PLUGIN_BASE, [
			'new_version' => '3.1.5',
			'Version' => '3.1.4'
		] );

		$result = ob_get_clean();

		// Assert
		$this->assertEmpty( $result );
	}
}
