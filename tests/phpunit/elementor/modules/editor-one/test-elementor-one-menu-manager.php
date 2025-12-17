<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Components\Elementor_One_Menu_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Elementor_One_Menu_Manager extends TestCase {

	private Elementor_One_Menu_Manager $menu_manager;
	private array $original_menu;
	private array $original_submenu;

	public function setUp(): void {
		parent::setUp();

		global $menu, $submenu;

		$this->original_menu = $menu ?? [];
		$this->original_submenu = $submenu ?? [];

		$menu = [];
		$submenu = [];

		$this->menu_manager = new Elementor_One_Menu_Manager();
	}

	public function tearDown(): void {
		parent::tearDown();

		global $menu, $submenu;

		$menu = $this->original_menu;
		$submenu = $this->original_submenu;

		remove_filter( 'user_has_cap', [ $this->menu_manager, 'grant_elementor_menu_capability' ], 10 );
	}

	public function test_grant_elementor_menu_capability__grants_manage_options_to_user_with_edit_posts() {
		$allcaps = [
			'edit_posts' => true,
		];
		$caps = [ 'manage_options' ];
		$args = [ 'manage_options' ];

		$result = $this->menu_manager->grant_elementor_menu_capability( $allcaps, $caps, $args );

		$this->assertTrue( $result['manage_options'] );
		$this->assertTrue( $result['edit_posts'] );
	}

	public function test_grant_elementor_menu_capability__does_not_grant_if_user_already_has_manage_options() {
		$allcaps = [
			'edit_posts' => true,
			'manage_options' => true,
		];
		$caps = [ 'manage_options' ];
		$args = [ 'manage_options' ];

		$result = $this->menu_manager->grant_elementor_menu_capability( $allcaps, $caps, $args );

		$this->assertTrue( $result['manage_options'] );
	}

	public function test_grant_elementor_menu_capability__does_not_grant_if_user_does_not_have_edit_posts() {
		$allcaps = [
			'read' => true,
		];
		$caps = [ 'manage_options' ];
		$args = [ 'manage_options' ];

		$result = $this->menu_manager->grant_elementor_menu_capability( $allcaps, $caps, $args );

		$this->assertArrayNotHasKey( 'manage_options', $result );
	}

	public function test_grant_elementor_menu_capability__returns_unchanged_for_non_manage_options_capability() {
		$allcaps = [
			'edit_posts' => true,
		];
		$caps = [ 'edit_posts' ];
		$args = [ 'edit_posts' ];

		$result = $this->menu_manager->grant_elementor_menu_capability( $allcaps, $caps, $args );

		$this->assertEquals( $allcaps, $result );
		$this->assertArrayNotHasKey( 'manage_options', $result );
	}

	public function test_adjust_elementor_menu_capability__changes_menu_capability_to_edit_posts() {
		global $menu;

		$menu = [
			10 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG, 'Elementor' ],
			20 => [ 'Other Menu', 'manage_options', 'other-menu', 'Other Menu' ],
		];

		$this->mock_current_user_can( true, false );

		$this->menu_manager->adjust_elementor_menu_capability();

		$this->assertEquals( 'edit_posts', $menu[10][1] );
		$this->assertEquals( 'manage_options', $menu[20][1] );
	}

	public function test_adjust_elementor_menu_capability__does_not_change_if_user_has_manage_options() {
		global $menu;

		$menu = [
			10 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG, 'Elementor' ],
		];

		$this->mock_current_user_can( true, true );

		$this->menu_manager->adjust_elementor_menu_capability();

		$this->assertEquals( 'manage_options', $menu[10][1] );
	}

	public function test_adjust_elementor_menu_capability__does_not_change_if_user_does_not_have_edit_posts() {
		global $menu;

		$menu = [
			10 => [ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG, 'Elementor' ],
		];

		$this->mock_current_user_can( false, false );

		$this->menu_manager->adjust_elementor_menu_capability();

		$this->assertEquals( 'manage_options', $menu[10][1] );
	}

	public function test_adjust_elementor_menu_capability__handles_menu_not_found() {
		global $menu;

		$menu = [
			20 => [ 'Other Menu', 'manage_options', 'other-menu', 'Other Menu' ],
		];

		$this->mock_current_user_can( true, false );

		$this->menu_manager->adjust_elementor_menu_capability();

		$this->assertEquals( 'manage_options', $menu[20][1] );
	}

	private function mock_current_user_can( bool $has_edit_posts, bool $has_manage_options ): void {
		global $mock_current_user_can_edit_posts, $mock_current_user_can_manage_options;
		$mock_current_user_can_edit_posts = $has_edit_posts;
		$mock_current_user_can_manage_options = $has_manage_options;

		if ( ! function_exists( '\\current_user_can' ) ) {
			require_once __DIR__ . '/mocks/wordpress-functions.php';
		}
	}
}

