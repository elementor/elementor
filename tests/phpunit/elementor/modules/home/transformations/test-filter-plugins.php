<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\Home\Transformations\Filter_Plugins;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Plugins extends PHPUnit_TestCase {

	private $wordpress_adapter;

	public function test_transform() {
		// Arrange
		$data = $this->mock_home_screen_data();

		$transformation = new Filter_Plugins( [
			'wordpress_adapter' => $this->wordpress_adapter,
		] );

		// Act
		$transformed_data = $transformation->transform( $data );
		$expected_data = $this->mock_home_screen_data_transformed();

		var_dump( $transformed_data );

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
						'url' => 'elementor/elementor.php',
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
						'url' => 'http://domain.ext/wp-admin/elementor/elementor.php?nonce=123',
						'type' => 'wporg',
						'button_label' => 'Activate',
						'target' => '_self'
					],
					[
						'Name' => 'Something Else',
						'Version' => '3.0.0',
						'file_path' => 'some/thing.php',
						'url' => 'http://domain.ext/wp-admin/some/thing.php?nonce=123',
						'type' => 'wporg',
						'target' => '_self'
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

		$wordpress_adapter_mock = $this->getMockBuilder( Wordpress_Adapter_Interface::class )
			->setMethods( [ 'get_plugins', 'is_plugin_active', 'wp_nonce_url', 'self_admin_url' ] )
			->getMock();

		$wordpress_adapter_mock->method( 'get_plugins' )->willReturn( $plugin_array );

		$wordpress_adapter_mock->method( 'is_plugin_active' )->willReturnMap( [
			[ 'elementor/elementor.php', false ],
			[ 'elementor-pro/elementor-pro.php', true ]
		] );

		$wordpress_adapter_mock->method( 'self_admin_url' )->willReturnMap( [
			[ 'elementor/elementor.php', 'http://domain.ext/wp-admin/elementor/elementor.php' ],
			[ 'elementor-pro/elementor-pro.php', 'http://domain.ext/wp-admin/elementor-pro/elementor-pro.php' ],
			[ 'some/thing.php', 'http://domain.ext/wp-admin/some/thing.php' ]
		] );

		$wordpress_adapter_mock->method( 'wp_nonce_url' )->willReturnMap( [
			[ 'http://domain.ext/wp-admin/elementor/elementor.php', 'http://domain.ext/wp-admin/elementor/elementor.php?nonce=123' ],
			[ 'http://domain.ext/wp-admin/elementor-pro/elementor-pro.php', 'http://domain.ext/wp-admin/elementor-pro/elementor-pro.php?nonce=123' ],
			[ 'http://domain.ext/wp-admin/some/thing.php', 'http://domain.ext/wp-admin/some/thing.php?nonce=123' ]
		] );

		$this->wordpress_adapter = $wordpress_adapter_mock;
	}
}
