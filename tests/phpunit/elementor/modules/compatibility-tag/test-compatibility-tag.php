<?php
namespace Elementor\Testing\Modules\CompatibilityTag;

use Elementor\Core\Utils\Version;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Modules\CompatibilityTag\Module;
use Elementor\Modules\CompatibilityTag\Compatibility_Tag;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Compatibility_Tag extends Elementor_Test_Base {
	public function test_check() {
		// Arrange
		$plugins = [
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
		];

		$this->mock_wp_api( [
			'get_plugins' => $plugins,
		] );

		$service = new Compatibility_Tag( Module::PLUGIN_VERSION_TESTED_HEADER );

		// Act
		/** @var Compatibility_Tag $service */
		$result = $service->check( Version::create_from_string( '3.1.5' ), array_keys( $plugins ) );

		// Assert
		$this->assertArrayHasKey( 'old', $result );
		$this->assertEquals( Compatibility_Tag::INCOMPATIBLE, $result['old'] );
		$this->assertArrayHasKey( 'invalid', $result );
		$this->assertEquals( Compatibility_Tag::INVALID_VERSION, $result['invalid'] );
		$this->assertArrayHasKey( 'patch', $result );
		$this->assertEquals( Compatibility_Tag::COMPATIBLE, $result['patch'] );
		$this->assertArrayHasKey( 'tested', $result );
		$this->assertEquals( Compatibility_Tag::COMPATIBLE, $result['tested'] );
		$this->assertArrayHasKey( 'not_exists', $result );
		$this->assertEquals( Compatibility_Tag::HEADER_NOT_EXISTS, $result['not_exists'] );
	}
}
