<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Core\Isolation\Elementor_Adapter;
use Elementor\Modules\Home\Transformations\Filter_Plugins;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Plugins extends PHPUnit_TestCase {

	private $elementor_adapter;

	public function test_transform() {
		// Arrange
		$data = $this->mock_home_screen_data();

		$transformation = new Filter_Plugins( [
			'elementor_adapter' => $this->elementor_adapter
		] );

		// Act
		$transformed_data = $transformation->transform( $data );
		$expected_data = $this->mock_home_screen_data_transformed();

		// Assert
		$this->assertTrue( $transformed_data === $expected_data );
	}

	private function mock_home_screen_data() {
		return [
			'add_ons' => [
				'repeater' => [
					[
						'Name' => 'Elementor',
						'Version' => '3.0.0',
						'file_path' => 'elementor/elementor.php',
						'url' => 'https://elementor.com',
						'type' => 'wporg',
					],
					[
						'Name' => 'Elementor Pro',
						'Version' => '3.0.0',
						'file_path' => 'elementor-pro/elementor-pro.php',
						'url' => 'https://elementor.com',
						'type' => 'ecom',
					],
					[
						'Name' => 'Something Else',
						'Version' => '3.0.0',
						'file_path' => 'some/thing.php',
						'url' => 'https://something.else',
						'type' => 'wporg',
					],
					[
						'Name' => 'Elementor AI',
						'Version' => '3.0.0',
						'url' => 'elementor-ai/elementor-ai.php',
						'type' => 'link',
					],
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	private function mock_home_screen_data_transformed() {
		return [
			'add_ons' => [
				'repeater' => [
					[
						'Name' => 'Elementor',
						'Version' => '3.0.0',
						'file_path' => 'elementor/elementor.php',
						'url' => 'https://elementor.com',
						'type' => 'wporg'
					],
					[
						'Name' => 'Elementor Pro',
						'Version' => '3.0.0',
						'file_path' => 'elementor-pro/elementor-pro.php',
						'url' => 'elementor-pro/elementor-pro.php?activate=true&nonce=123',
						'type' => 'ecom',
						'button_label' => 'Activate',
						'target' => '_self'
					],
					[
						'Name' => 'Something Else',
						'Version' => '3.0.0',
						'file_path' => 'some/thing.php',
						'url' => 'some/thing.php?nonce=123',
						'type' => 'wporg',
						'target' => '_self'
					],
					[
						'Name' => 'Elementor AI',
						'Version' => '3.0.0',
						'url' => 'elementor-ai/elementor-ai.php',
						'type' => 'link'
					],
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	public function setUp(): void {
		parent::setUp();

		$elementor_adapter_mock = $this->getMockBuilder( Elementor_Adapter::class )
			->setMethods( [ 'is_plugin_installed', 'is_plugin_activated', 'get_install_plugin_url', 'get_activate_plugin_url' ] )
			->getMock();

//		$elementor_adapter_mock->method( 'removeAmpersandFromUrl' )->willReturn( 'some/url' );

		$elementor_adapter_mock->method( 'is_plugin_installed' )->willReturnMap( [
			[ 'elementor/elementor.php', true ],
			[ 'elementor-pro/elementor-pro.php', true ],
			[ 'some/thing.php', false ]
		] );

		$elementor_adapter_mock->method( 'is_plugin_activated' )->willReturnMap( [
			[ 'elementor/elementor.php', true ],
			[ 'elementor-pro/elementor-pro.php', false ]
		] );

		$elementor_adapter_mock->method( 'get_install_plugin_url' )->willReturnMap( [
			[ 'elementor/elementor.php', 'elementor/elementor.php?nonce=123' ],
			[ 'elementor-pro/elementor-pro.php', 'elementor-pro/elementor-pro.php?nonce=123' ],
			[ 'some/thing.php', 'some/thing.php?nonce=123' ]
		] );

		$elementor_adapter_mock->method( 'get_activate_plugin_url' )->willReturnMap( [
			[ 'elementor/elementor.php', 'elementor/elementor.php?activate=true&nonce=123' ],
			[ 'elementor-pro/elementor-pro.php', 'elementor-pro/elementor-pro.php?activate=true&nonce=123' ]
		] );

		$this->elementor_adapter = $elementor_adapter_mock;
	}
}
