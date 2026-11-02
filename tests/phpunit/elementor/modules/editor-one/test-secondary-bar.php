<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Map;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Secondary_Bar;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Secondary_Bar extends Elementor_Test_Base {

	private Menu_Data_Provider $provider;

	private Secondary_Bar $secondary_bar;

	public function setUp(): void {
		parent::setUp();

		$this->reset_menu_data_provider();
		$this->provider = Menu_Data_Provider::instance();
		$this->secondary_bar = new Secondary_Bar();
		$this->act_as_admin();
	}

	public function tearDown(): void {
		$this->reset_menu_data_provider();
		parent::tearDown();
	}

	public function test_get_bar__home_has_no_bar() {
		// Arrange
		$this->register_item( 'elementor-settings', 'Settings' );

		// Act
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_HOME,
			'group' => '',
			'tab' => '',
		] );

		// Assert
		$this->assertSame( [], $bar );
	}

	public function test_get_bar__single_tab_is_shown() {
		// Arrange
		$this->register_item( 'e-form-submissions', 'Submissions' );

		// Act
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_SUBMISSIONS,
			'group' => Admin_Flow_Config::GROUP_SUBMISSIONS,
			'tab' => 'submissions',
		] );

		// Assert
		$this->assertCount( 1, $bar['tabs'] );
		$this->assertTrue( $bar['tabs'][0]['is_active'] );
		$this->assertSame( [], $bar['addons'] );
	}

	public function test_get_bar__settings_marks_the_active_tab_and_lists_addons() {
		// Arrange
		$this->register_item( 'elementor-settings', 'Settings' );
		$this->register_item( 'elementor-tools', 'Tools' );
		$this->register_item( 'late-addon', 'Late Addon', Menu_Config::THIRD_PARTY_GROUP_ID, 30 );
		$this->register_item( 'early-addon', 'Early Addon', Menu_Config::THIRD_PARTY_GROUP_ID, 10 );
		$this->register_item( 'hidden-addon', 'Hidden Addon', Menu_Config::THIRD_PARTY_GROUP_ID, 5, false );

		// Act
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_SETTINGS,
			'group' => Admin_Flow_Config::GROUP_SETTINGS,
			'tab' => 'settings',
		] );

		// Assert
		$active_tabs = array_values( array_filter( $bar['tabs'], fn( array $tab ) => $tab['is_active'] ) );
		$this->assertSame( 'settings', $active_tabs[0]['id'] );
		$this->assertSame( [ 'Early Addon', 'Late Addon' ], array_column( $bar['addons'], 'label' ) );
	}

	public function test_get_bar__addons_are_hidden_outside_settings_and_tools() {
		// Arrange
		$this->register_item( Menu_Config::LEGACY_TEMPLATES_SLUG, 'Saved Templates' );
		$this->register_item( 'addon-page', 'Addon Page', Menu_Config::THIRD_PARTY_GROUP_ID );

		// Act
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_TEMPLATES,
			'group' => Admin_Flow_Config::GROUP_TEMPLATES,
			'tab' => 'saved-templates',
		] );

		// Assert
		$this->assertSame( [], $bar['addons'] );
	}

	public function test_get_bar__addons_are_hidden_when_the_third_party_group_is_empty() {
		// Arrange
		$this->register_item( 'elementor-tools', 'Tools' );

		// Act
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_TOOLS,
			'group' => Admin_Flow_Config::GROUP_SETTINGS,
			'tab' => 'tools',
		] );

		// Assert
		$this->assertSame( [], $bar['addons'] );
	}

	public function test_render__keeps_destinations_in_the_markup() {
		// Arrange
		$this->register_item( 'e-form-submissions', 'Submissions' );
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_SUBMISSIONS,
			'group' => Admin_Flow_Config::GROUP_SUBMISSIONS,
			'tab' => 'submissions',
		] );

		// Act
		ob_start();
		$this->secondary_bar->render( $bar );
		$html = ob_get_clean();

		// Assert
		$this->assertStringContainsString( 'href="' . esc_url( admin_url( 'admin.php?page=e-form-submissions' ) ) . '"', $html );
		$this->assertStringContainsString( 'aria-current="page"', $html );
		$this->assertStringContainsString( 'aria-label="' . esc_attr__( 'Finder', 'elementor' ) . '"', $html );
		$this->assertStringNotContainsString( 'e-admin-secondary-bar__addons', $html );
	}

	public function test_render__addons_menu_contains_third_party_links() {
		// Arrange
		$this->register_item( 'elementor-settings', 'Settings' );
		$this->register_item( 'addon-page', 'Addon Page', Menu_Config::THIRD_PARTY_GROUP_ID );
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_SETTINGS,
			'group' => Admin_Flow_Config::GROUP_SETTINGS,
			'tab' => 'settings',
		] );

		// Act
		ob_start();
		$this->secondary_bar->render( $bar );
		$html = ob_get_clean();

		// Assert
		$this->assertStringContainsString( 'e-admin-secondary-bar__addons', $html );
		$this->assertStringContainsString( 'href="' . esc_url( admin_url( 'admin.php?page=addon-page' ) ) . '"', $html );
		$this->assertStringContainsString( 'Addon Page', $html );
	}

	private function create_map(): Admin_Flow_Map {
		return new Admin_Flow_Map( $this->provider, Admin_Flow_Config::get_config() );
	}

	private function register_item( string $slug, string $label, string $group_id = 'test-group', int $position = 10, bool $visible = true ): void {
		$item = $this->createMock( Menu_Item_Interface::class );
		$item->method( 'get_slug' )->willReturn( $slug );
		$item->method( 'get_label' )->willReturn( $label );
		$item->method( 'get_group_id' )->willReturn( $group_id );
		$item->method( 'get_parent_slug' )->willReturn( Menu_Config::ELEMENTOR_MENU_SLUG );
		$item->method( 'get_capability' )->willReturn( 'manage_options' );
		$item->method( 'is_visible' )->willReturn( $visible );
		$item->method( 'get_position' )->willReturn( $position );

		$this->provider->register_level4_item( $item );
	}

	private function reset_menu_data_provider(): void {
		$reflection = new \ReflectionClass( Menu_Data_Provider::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}
}
