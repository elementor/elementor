<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\Home\Transformations\Filter_Plugins;
use ElementorEditorTesting\Elementor_Test_Base;
use PHPUnit\Framework\MockObject\MockObject;

class Test_Filter_Plugins extends Elementor_Test_Base {

	private $wordpress_adapter;

	public function test_filter_plugins() {
		// Arrange
		$data = $this->mock_home_screen_data();
		$transformation = new Filter_Plugins( $data, $this->wordpress_adapter );

		// Act
		$transformed_data = $transformation->transform();
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
					],
					[
						'Name' => 'Something Else',
						'Version' => '3.0.0',
						'file_path' => 'some/thing.php',
					],
					[
						'Name' => 'Elementor AI',
						'Version' => '3.0.0',
						'url' => 'elementor/elementor.php',
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
						'is_installed' => true,
					],
					[
						'Name' => 'Something Else',
						'Version' => '3.0.0',
						'file_path' => 'some/thing.php',
						'is_installed' => false,
					],
					[
						'Name' => 'Elementor AI',
						'Version' => '3.0.0',
						'url' => 'elementor/elementor.php',
					],
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	private function installed_plugins() {
		return [
			'elementor/elementor.php' => [
				'Name' => 'Elementor',
				'Version' => '3.0.0'
			],
			'elementor-pro/elementor-pro.php' => [
				'Name' => 'Elementor Pro',
				'Version' => '3.0.0'
			],
		];
	}

	public function setUp(): void {
		parent::setUp();
		$plugin_array = $this->installed_plugins();
		$wordpress_adapter_mock = $this->getMockBuilder( Wordpress_Adapter_Interface::class )->getMock();
		$wordpress_adapter_mock->method( 'get_plugins' )->willReturn( $plugin_array );

		$this->wordpress_adapter = $wordpress_adapter_mock;
	}
}
