<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\Promotions\AdminMenuItems\Go_Pro_Promotion_Item;
use Elementor\Modules\Promotions\Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../components/mocks/mock-pro-license-api.php';

class Test_Module extends Elementor_Test_Base {
	private bool $pro_version_was_defined = false;

	public function set_up() {
		parent::set_up();

		$this->pro_version_was_defined = defined( 'ELEMENTOR_PRO_VERSION' );

		if ( ! $this->pro_version_was_defined ) {
			define( 'ELEMENTOR_PRO_VERSION', '99.99.99' );
		}

		\Mock_Pro_License_API::reset();
		\Mock_Pro_License_API::set_license_state( true );
	}

	public function tear_down() {
		remove_all_filters( 'elementor_one/upgrade_url' );
		\Mock_Pro_License_API::reset();

		parent::tear_down();
	}

	public function test_is_active__returns_true_when_pro_license_is_active() {
		// Arrange
		\Mock_Pro_License_API::set_license_state( true );

		// Act
		$is_active = Module::is_active();

		// Assert
		$this->assertTrue( $is_active );
	}

	public function test_is_active__returns_true_when_pro_license_is_inactive() {
		// Arrange
		\Mock_Pro_License_API::set_license_state( false );

		// Act
		$is_active = Module::is_active();

		// Assert
		$this->assertTrue( $is_active );
	}

	public function test_get_upgrade_redirect_url__returns_selected_action_url() {
		// Arrange
		$this->act_as_admin();
		$this->reset_menu_data_provider();
		Menu_Data_Provider::instance()->register_level4_item( $this->create_action_item( 'https://go.elementor.com/wp-menu-renew/' ) );

		// Act
		$url = ( new Module() )->get_upgrade_redirect_url();

		// Assert
		$this->assertSame( 'https://go.elementor.com/wp-menu-renew/', $url );
	}

	public function test_get_upgrade_redirect_url__falls_back_when_filter_returns_foreign_host() {
		// Arrange
		$this->reset_menu_data_provider();
		add_filter( 'elementor_one/upgrade_url', fn() => 'https://evil.example.com/' );

		// Act
		$url = ( new Module() )->get_upgrade_redirect_url();

		// Assert
		$this->assertSame( Go_Pro_Promotion_Item::get_url(), $url );
	}

	public function test_get_upgrade_redirect_url__falls_back_when_filter_returns_non_string() {
		// Arrange
		$this->reset_menu_data_provider();
		add_filter( 'elementor_one/upgrade_url', '__return_null' );

		// Act
		$url = ( new Module() )->get_upgrade_redirect_url();

		// Assert
		$this->assertSame( Go_Pro_Promotion_Item::get_url(), $url );
	}

	private function create_action_item( string $slug ): Menu_Item_Interface {
		$item = $this->createMock( Menu_Item_Interface::class );
		$item->method( 'get_slug' )->willReturn( $slug );
		$item->method( 'get_label' )->willReturn( 'Renew Now' );
		$item->method( 'get_group_id' )->willReturn( Menu_Config::SYSTEM_GROUP_ID );
		$item->method( 'get_parent_slug' )->willReturn( Menu_Config::ELEMENTOR_HOME_MENU_SLUG );
		$item->method( 'get_capability' )->willReturn( 'manage_options' );
		$item->method( 'get_position' )->willReturn( 61 );
		$item->method( 'is_visible' )->willReturn( true );

		return $item;
	}

	private function reset_menu_data_provider(): void {
		$instance_property = new \ReflectionProperty( Menu_Data_Provider::class, 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}
}
