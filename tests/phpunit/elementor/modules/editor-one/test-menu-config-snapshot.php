<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\App\Modules\KitLibrary\Module as KitLibraryModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Module as EditorOneModule;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Menu_Config_Snapshot extends Elementor_Test_Base {

	private const SNAPSHOT_FILE = __DIR__ . '/snapshots/menu-config-snapshot.json';

	public function setUp(): void {
		parent::setUp();

		$this->activate_editor_one_experiment();
		$this->reset_menu_data_provider();
		$this->simulate_admin_context();
	}

	public function tearDown(): void {
		parent::tearDown();

		$this->reset_menu_data_provider();
		$this->restore_screen_context();
	}

	public function test_menu_config__matches_expected_snapshot_via_action() {
		$this->act_as_admin();
		$menu_data_provider = Menu_Data_Provider::instance();

		do_action( 'elementor/editor-one/menu/register', $menu_data_provider );
		$this->trigger_admin_only_registrations( $menu_data_provider );

		$actual_config = $this->normalize_config( [
			'editorFlyout' => $menu_data_provider->get_editor_flyout_data(),
			'level4Flyouts' => $menu_data_provider->get_level4_flyout_data(),
		] );

		if ( ! file_exists( self::SNAPSHOT_FILE ) ) {
			$this->save_snapshot( $actual_config );
			$this->markTestSkipped( 'Snapshot created. Run test again to verify.' );
		}

		$expected_config = $this->load_snapshot();
		$this->assertEquals( $expected_config, $actual_config );
	}

	public function test_menu_registration_action__registers_menu_items() {
		$this->act_as_admin();
		$menu_data_provider = Menu_Data_Provider::instance();

		do_action( 'elementor/editor-one/menu/register', $menu_data_provider );
		$this->trigger_admin_only_registrations( $menu_data_provider );
		$flyout_data = $menu_data_provider->get_editor_flyout_data();

		$this->assertNotEmpty( $flyout_data['items'] );
		$slugs = array_column( $flyout_data['items'], 'slug' );
		$this->assertContains( 'elementor', $slugs );
		$this->assertContains( 'elementor-settings', $slugs );
		$this->assertContains( 'elementor-tools', $slugs );
	}

	public function test_menu_registration_action__registers_system_menu_with_children() {
		$this->act_as_admin();
		$menu_data_provider = Menu_Data_Provider::instance();

		do_action( 'elementor/editor-one/menu/register', $menu_data_provider );
		$this->trigger_admin_only_registrations( $menu_data_provider );
		$flyout_data = $menu_data_provider->get_editor_flyout_data();
		$level4_data = $menu_data_provider->get_level4_flyout_data();

		$slugs = array_column( $flyout_data['items'], 'slug' );
		$this->assertContains( 'elementor-system', $slugs );
		$this->assertArrayHasKey( Menu_Config::SYSTEM_GROUP_ID, $level4_data );
		$this->assertNotEmpty( $level4_data[ Menu_Config::SYSTEM_GROUP_ID ]['items'] );
	}

	public function test_menu_registration_action__registers_templates_menu_with_children() {
		$this->act_as_admin();
		$menu_data_provider = Menu_Data_Provider::instance();

		do_action( 'elementor/editor-one/menu/register', $menu_data_provider );
		$this->trigger_admin_only_registrations( $menu_data_provider );
		$flyout_data = $menu_data_provider->get_editor_flyout_data();
		$level4_data = $menu_data_provider->get_level4_flyout_data();

		$slugs = array_column( $flyout_data['items'], 'slug' );
		$this->assertContains( 'elementor-templates', $slugs );
		$this->assertArrayHasKey( Menu_Config::TEMPLATES_GROUP_ID, $level4_data );
		$templates_group = $level4_data[ Menu_Config::TEMPLATES_GROUP_ID ];
		$this->assertNotEmpty( $templates_group['items'] );

		$children_slugs = array_column( $templates_group['items'], 'slug' );
		$this->assertContains( 'edit.php?post_type=elementor_library', $children_slugs );
		$this->assertContains( 'elementor-app', $children_slugs );
		$this->assertContains( 'popup_templates', $children_slugs );
	}

	public function test_menu_registration_action__registers_promotions_menu_items() {
		$this->act_as_admin();
		$menu_data_provider = Menu_Data_Provider::instance();

		do_action( 'elementor/editor-one/menu/register', $menu_data_provider );
		$this->trigger_admin_only_registrations( $menu_data_provider );
		$level4_data = $menu_data_provider->get_level4_flyout_data();

		$this->assertArrayHasKey( Menu_Config::CUSTOM_ELEMENTS_GROUP_ID, $level4_data );
		$custom_elements_group = $level4_data[ Menu_Config::CUSTOM_ELEMENTS_GROUP_ID ];
		$this->assertNotEmpty( $custom_elements_group['items'] );

		$slugs = array_column( $custom_elements_group['items'], 'slug' );
		$this->assertContains( 'elementor_custom_fonts', $slugs );
		$this->assertContains( 'elementor_custom_icons', $slugs );
	}

	public function test_menu_registration_action__level3_items_have_required_properties() {
		$this->act_as_admin();
		$menu_data_provider = Menu_Data_Provider::instance();

		do_action( 'elementor/editor-one/menu/register', $menu_data_provider );
		$this->trigger_admin_only_registrations( $menu_data_provider );
		$flyout_data = $menu_data_provider->get_editor_flyout_data();

		foreach ( $flyout_data['items'] as $item ) {
			$this->assertArrayHasKey( 'slug', $item );
			$this->assertArrayHasKey( 'label', $item );
			$this->assertArrayHasKey( 'url', $item );
			$this->assertArrayHasKey( 'icon', $item );
			$this->assertArrayHasKey( 'priority', $item );
		}
	}

	public function test_menu_registration_action__flyout_has_correct_parent_slug() {
		$this->act_as_admin();
		$menu_data_provider = Menu_Data_Provider::instance();

		do_action( 'elementor/editor-one/menu/register', $menu_data_provider );
		$this->trigger_admin_only_registrations( $menu_data_provider );
		$flyout_data = $menu_data_provider->get_editor_flyout_data();

		$this->assertEquals( Menu_Config::EDITOR_MENU_SLUG, $flyout_data['parent_slug'] );
	}

	private function activate_editor_one_experiment(): void {
		$experiments = Plugin::instance()->experiments;
		$experiments->set_feature_default_state(
			EditorOneModule::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
	}

	private function simulate_admin_context(): void {
		if ( ! class_exists( 'WP_Screen' ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-screen.php';
			require_once ABSPATH . 'wp-admin/includes/screen.php';
		}
		set_current_screen( 'dashboard' );
	}

	private function restore_screen_context(): void {
		$GLOBALS['current_screen'] = null;
	}

	private function trigger_admin_only_registrations( Menu_Data_Provider $menu_data_provider ): void {
		$this->call_source_local_registration( $menu_data_provider );
		$this->call_kit_library_registration( $menu_data_provider );
	}

	private function call_source_local_registration( Menu_Data_Provider $menu_data_provider ): void {
		$source_local = Plugin::instance()->templates_manager->get_source( 'local' );
		if ( ! $source_local instanceof Source_Local ) {
			return;
		}

		$reflection = new \ReflectionClass( $source_local );
		$method = $reflection->getMethod( 'register_editor_one_menu' );
		$method->setAccessible( true );
		$method->invoke( $source_local, $menu_data_provider );
	}

	private function call_kit_library_registration( Menu_Data_Provider $menu_data_provider ): void {
		$kit_library = Plugin::instance()->app->get_component( 'kit-library' );

		if ( $kit_library instanceof KitLibraryModule ) {
			$reflection = new \ReflectionClass( $kit_library );
			$method = $reflection->getMethod( 'register_editor_one_menu' );
			$method->setAccessible( true );
			$method->invoke( $kit_library, $menu_data_provider );
			return;
		}

		$kit_library_module = new KitLibraryModule();
		$reflection = new \ReflectionClass( $kit_library_module );
		$method = $reflection->getMethod( 'register_editor_one_menu' );
		$method->setAccessible( true );
		$method->invoke( $kit_library_module, $menu_data_provider );
	}

	private function normalize_config( array $config ): array {
		if ( isset( $config['editorFlyout']['items'] ) ) {
			foreach ( $config['editorFlyout']['items'] as &$item ) {
				if ( isset( $item['url'] ) ) {
					$item['url'] = $this->normalize_url( $item['url'] );
				}
			}
		}

		if ( isset( $config['level4Flyouts'] ) ) {
			foreach ( $config['level4Flyouts'] as &$group ) {
				if ( isset( $group['items'] ) ) {
					foreach ( $group['items'] as &$item ) {
						if ( isset( $item['url'] ) ) {
							$item['url'] = $this->normalize_url( $item['url'] );
						}
					}
				}
			}
		}

		return $config;
	}

	private function normalize_url( string $url ): string {
		$parsed = wp_parse_url( $url );
		$path = $parsed['path'] ?? '';

		if ( isset( $parsed['query'] ) ) {
			$path .= '?' . $parsed['query'];
		}

		if ( isset( $parsed['fragment'] ) ) {
			$path .= '#' . $parsed['fragment'];
		}

		return $path;
	}

	private function load_snapshot(): array {
		$json = file_get_contents( self::SNAPSHOT_FILE );
		return json_decode( $json, true );
	}

	private function save_snapshot( array $config ): void {
		$json = json_encode( $config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
		file_put_contents( self::SNAPSHOT_FILE, $json );
	}

	private function reset_menu_data_provider(): void {
		$reflection = new \ReflectionClass( Menu_Data_Provider::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}
}
