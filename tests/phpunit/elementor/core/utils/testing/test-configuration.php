<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Testing\Configuration;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Configuration extends Elementor_Test_Base {
	public function test_initialization_config_parsed() {
		// Arrange
		$config = [
			'subject' => 'test_subject',
			'stop_on_failure' => true,
			'stop_on_error' => true,
		];

		// Act
		$configuration = new Configuration( $config );

		// Assert
		$this->assertEqualFields( $configuration, $config );
	}

	public function test_create_returns_new_configuration_when_config_array_provided() {
		// Arrange
		$config = [
			'subject' => 'test_subject',
			'stop_on_failure' => true,
			'stop_on_error' => true,
		];

		// Assert
		$this->assertInstanceOf( Configuration::class, Configuration::create( $config ) );
	}

	public function test_create_returns_given_configuration_when_configuration_object_provided() {
		// Arrange
		$configuration = new Configuration();

		// Assert
		$this->assertSame( $configuration, Configuration::create( $configuration ) );
	}
}
