<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Isolation;

use Elementor\Core\Isolation\Plugin_Status_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Plugin_Status_Adapter extends PHPUnit_TestCase {

	private $wordpress_adapter;

	public function __construct( ?string $name = null, array $data = [], $dataName = '' ) {
		parent::__construct( $name, $data, $dataName );
		$this->wordpress_adapter = null;
	}

	public function test_is_plugin_installed() {
		// Arrange
		$adapter = new Plugin_Status_Adapter( $this->wordpress_adapter );

		// Act
		$is_elementor_installed = $adapter->is_plugin_installed( 'elementor/elementor.php' );
		$is_elementor_pro_installed = $adapter->is_plugin_installed( 'elementor-pro/elementor-pro.php' );

		// Assert
		$this->assertTrue( $is_elementor_installed );
		$this->assertFalse( $is_elementor_pro_installed );
	}

	public function test_get_install_plugin_url() {
		// Arrange
		$adapter = new Plugin_Status_Adapter( $this->wordpress_adapter );

		// Act
		$elementor_install_url = $adapter->get_install_plugin_url( 'elementor/elementor.php' );
		$expected_core_url = 'wp-admin/update.php?action=install-plugin&amp;plugin=elementor&amp;_wpnonce=';

		// Assert
		$this->assertTrue( str_contains( $elementor_install_url, $expected_core_url ) );
	}

	public function test_get_activate_plugin_url() {
		// Arrange
		$adapter = new Plugin_Status_Adapter( $this->wordpress_adapter );

		// Act
		$elementor_activate_url = $adapter->get_activate_plugin_url( 'elementor/elementor.php' );
		$expected_core_url = 'plugins.php?action=activate&amp;plugin=elementor%2Felementor.php&amp;plugin_status=all&amp;paged=1&amp;s&amp;_wpnonce=';

		// Assert
		$this->assertTrue( str_contains( $elementor_activate_url, $expected_core_url ) );
	}

	public function setUp(): void {
		parent::setUp();

		$wordpress_adapter_mock = $this->getMockBuilder( Wordpress_Adapter::class )
			->setMethods( [ 'get_plugins' ] )
			->getMock();

		$wordpress_adapter_mock->method( 'get_plugins' )->willReturn(
			[
				'elementor/elementor.php' => 'value',
			]
		);

		$this->wordpress_adapter = $wordpress_adapter_mock;
	}
}
