<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
require_once ABSPATH . 'wp-admin/includes/class-plugin-upgrader.php';

use Elementor\Core\Utils\Collection;
use Elementor\Core\Utils\Plugins_Manager;
use Elementor\Core\Wp_Api;
use Elementor\Plugin;
use Plugin_Upgrader;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Plugins_Manager extends Elementor_Test_Base {

	/**
	 * @var Wp_Api
	 */
	private $original_wp_api;

	/**
	 * @var Wp_Api
	 */
	private $wp_api_mock;

	/**
	 * @var Plugin_Upgrader
	 */
	private $plugin_upgrader_mock;

	public function setUp(): void {
		parent::setUp();

		$this->original_wp_api = Plugin::$instance->wp;

		$this->wp_api_mock = $this->getMockBuilder( Wp_Api::class )
			->setMethods( [ 'get_plugins', 'plugins_api', 'is_plugin_active', 'activate_plugin' ] )
			->getMock();

		Plugin::$instance->wp = $this->wp_api_mock;

		$this->plugin_upgrader_mock = $this->getMockBuilder( Plugin_Upgrader::class )
			->setMethods( [ 'install' ] )
			->getMock();

	}

	public function tearDown(): void {
		parent::tearDown();

		Plugin::$instance->wp = $this->original_wp_api;
	}

	public function test_install__array_of_plugins() {
		// Arrange
		$plugins = [ 'elementor/elementor-test.php', 'elementor-pro/elementor-pro-test.php' ];

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'get_plugins' )
			->willReturn( $this->get_plugins_mock() );

		$this->wp_api_mock
			->expects( $this->exactly( 2 ) )
			->method( 'plugins_api' )
			->withConsecutive(
				$this->plugins_api_parameters_mock( 'elementor' ),
				$this->plugins_api_parameters_mock( 'elementor-pro' )
			)
			->willReturn( $this->plugins_api_return_mock() );

		$this->plugin_upgrader_mock
			->expects( $this->exactly( 2 ) )
			->method( 'install' )
			->willReturn( true );

		$plugins_manager = new Plugins_Manager( $this->plugin_upgrader_mock );

		// Act
		$install = $plugins_manager->install( $plugins );

		// Assert
		$this->assertEquals( $install['succeeded'], $plugins );

	}

	public function test_install__single_plugin_as_a_string() {
		// Arrange
		$plugin = 'elementor/elementor-test.php';

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'get_plugins' )
			->willReturn( $this->get_plugins_mock() );

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'plugins_api' )
			->with( ...$this->plugins_api_parameters_mock( 'elementor' ) )
			->willReturn( $this->plugins_api_return_mock() );

		$this->plugin_upgrader_mock
			->expects( $this->once() )
			->method( 'install' )
			->willReturn( true );

		$plugins_manager = new Plugins_Manager( $this->plugin_upgrader_mock );

		// Act
		$install = $plugins_manager->install( $plugin );

		// Assert
		$this->assertEquals( $install['succeeded'], [ $plugin ] );
	}

	public function test_install__failed_by_plugin_upgrader() {
		// Arrange
		$plugins = [ 'elementor/elementor-test.php' ];

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'get_plugins' )
			->willReturn( $this->get_plugins_mock() );

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'plugins_api' )
			->with( ...$this->plugins_api_parameters_mock( 'elementor' ) )
			->willReturn( $this->plugins_api_return_mock() );

		$this->plugin_upgrader_mock
			->expects( $this->once() )
			->method( 'install' )
			->willReturn( false );

		$plugins_manager = new Plugins_Manager( $this->plugin_upgrader_mock );

		// Act
		$install = $plugins_manager->install( $plugins );

		// Assert
		$this->assertEquals( $install['failed'], $plugins );
	}

	public function test_install__failed_by_missing_download_link() {
		// Arrange
		$plugins = [ 'elementor/elementor-test.php' ];

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'get_plugins' )
			->willReturn( $this->get_plugins_mock() );

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'plugins_api' )
			->with( ...$this->plugins_api_parameters_mock( 'elementor' ) )
			->willReturn( [] );

		$this->plugin_upgrader_mock
			->expects( $this->never() )
			->method( 'install' );

		$plugins_manager = new Plugins_Manager( $this->plugin_upgrader_mock );

		// Act
		$install = $plugins_manager->install( $plugins );

		// Assert
		$this->assertEquals( $install['failed'], $plugins );
	}

	public function test_activate__array_of_plugins_with_one_already_activated() {
		// Arrange
		$plugins = [ 'elementor/elementor-test.php', 'elementor-pro/elementor-pro-test.php' ];

		$this->wp_api_mock
			->expects( $this->exactly( 3 ) )
			->method( 'is_plugin_active' )
			->withConsecutive(
				 [ 'elementor/elementor-test.php' ],
				[ 'elementor/elementor-test.php' ],
				[ 'elementor-pro/elementor-pro-test.php' ]
			)
			->willReturnOnConsecutiveCalls( false, true , true );

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'activate_plugin' )
			->with( 'elementor/elementor-test.php' );

		$plugins_manager = new Plugins_Manager();

		// Act
		$activate = $plugins_manager->activate( $plugins );

		// Assert
		$this->assertEquals( $activate['succeeded'], $plugins );
	}

	public function test_activate__single_plugin_as_a_string() {
		// Arrange
		$plugin = 'elementor/elementor-test.php';

		$this->wp_api_mock
			->expects( $this->exactly( 2 ) )
			->method( 'is_plugin_active' )
			->with( 'elementor/elementor-test.php' )
			->willReturnOnConsecutiveCalls( false, true );

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'activate_plugin' )
			->with( 'elementor/elementor-test.php' );

		$plugins_manager = new Plugins_Manager();

		// Act
		$activate = $plugins_manager->activate( $plugin );

		// Assert
		$this->assertEquals( $activate['succeeded'], [ $plugin ] );
	}

	public function test_activate__failed() {
		// Arrange
		$plugin = [ 'elementor/elementor-test.php' ];

		$this->wp_api_mock
			->expects( $this->exactly( 2 ) )
			->method( 'is_plugin_active' )
			->with( 'elementor/elementor-test.php' )
			->willReturn( false );

		$this->wp_api_mock
			->expects( $this->once() )
			->method( 'activate_plugin' )
			->with( 'elementor/elementor-test.php' );

		$plugins_manager = new Plugins_Manager();

		// Act
		$activate = $plugins_manager->activate( $plugin );

		// Assert
		$this->assertEquals( $activate['failed'], $plugin );
	}

	private function plugins_api_return_mock() {
		return (object) [
			'download_link' => 'download_link',
		];
	}

	private function plugins_api_parameters_mock( $slug ) {
		return [
			'plugin_information',
			[
				'slug' => $slug,
				'fields' => [
					'short_description' => false,
					'sections' => false,
					'requires' => false,
					'rating' => false,
					'ratings' => false,
					'downloaded' => false,
					'last_updated' => false,
					'added' => false,
					'tags' => false,
					'compatibility' => false,
					'homepage' => false,
					'donate_link' => false,
				],
			]
		];
	}

	private function get_plugins_mock() {
		return new Collection( [] );
	}
}
