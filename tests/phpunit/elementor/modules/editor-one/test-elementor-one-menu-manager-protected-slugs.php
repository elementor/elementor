<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Elementor_One_Menu_Manager_Protected_Slugs extends Elementor_Test_Base {

	private Elementor_One_Menu_Manager $menu_manager;
	private array $original_submenu;

	public function setUp(): void {
		parent::setUp();

		global $submenu;
		$this->original_submenu = $submenu ?? [];

		$this->reset_menu_data_provider();
		$this->menu_manager = new Elementor_One_Menu_Manager();
	}

	public function tearDown(): void {
		parent::tearDown();

		global $submenu;
		$submenu = $this->original_submenu;

		$this->reset_menu_data_provider();
	}

	public function test_hide_flyout_items_from_wp_menu__keeps_agents_ready_like_mcp() {
		// Arrange
		global $submenu;
		$submenu[ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ] = [
			[ 'Elementor MCP', 'manage_options', 'elementor-mcp' ],
			[ 'Agents Ready', 'manage_options', 'elementor-agents-ready' ],
			[ 'Element Manager', 'manage_options', 'elementor-element-manager' ],
		];

		$this->register_flyout_item( 'elementor-mcp' );
		$this->register_flyout_item( 'elementor-agents-ready' );
		$this->register_flyout_item( 'elementor-element-manager' );

		// Act
		$this->menu_manager->hide_flyout_items_from_wp_menu();

		// Assert
		$remaining_slugs = array_column( $submenu[ Menu_Config::ELEMENTOR_HOME_MENU_SLUG ], 2 );

		$this->assertContains( 'elementor-mcp', $remaining_slugs );
		$this->assertContains( 'elementor-agents-ready', $remaining_slugs );
		$this->assertNotContains( 'elementor-element-manager', $remaining_slugs );
	}

	private function register_flyout_item( string $slug ): void {
		$item = $this->createMock( Menu_Item_Third_Level_Interface::class );
		$item->method( 'get_slug' )->willReturn( $slug );
		$item->method( 'get_group_id' )->willReturn( Menu_Config::EDITOR_GROUP_ID );
		$item->method( 'get_parent_slug' )->willReturn( Menu_Config::ELEMENTOR_HOME_MENU_SLUG );

		Menu_Data_Provider::instance()->register_level3_item( $item );
	}

	private function reset_menu_data_provider(): void {
		$reflection = new \ReflectionClass( Menu_Data_Provider::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}
}
