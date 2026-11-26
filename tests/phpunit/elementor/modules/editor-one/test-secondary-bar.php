<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_With_Tag_Interface;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Admin_Flow_Map;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Secondary_Bar;
use Elementor\Modules\EditorOne\Components\Admin_Flow_Handler;
use Elementor\Modules\EditorOne\Components\Secondary_Bar_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Secondary_Bar extends Elementor_Test_Base {

	private Menu_Data_Provider $provider;

	private Secondary_Bar $secondary_bar;

	private array $handlers = [];

	private $original_screen;

	public function setUp(): void {
		parent::setUp();

		$this->original_screen = $GLOBALS['current_screen'] ?? null;

		$this->reset_menu_data_provider();
		$this->provider = Menu_Data_Provider::instance();
		$this->secondary_bar = new Secondary_Bar();
		$this->act_as_admin();
	}

	public function tearDown(): void {
		foreach ( $this->handlers as $handler ) {
			remove_action( 'admin_enqueue_scripts', [ $handler, 'enqueue_assets' ], 20 );
			remove_action( 'in_admin_header', [ $handler, 'register_container' ] );
			remove_action( 'admin_notices', [ $handler, 'render_container' ], PHP_INT_MIN );
		}

		wp_deregister_script( Secondary_Bar_Handler::SCRIPT_HANDLE );
		remove_filter( 'elementor/editor-one/admin-edit-post-types', [ $this, 'filter_editor_one_post_types' ] );
		$GLOBALS['current_screen'] = $this->original_screen;
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
		$this->assertCount( 1, $active_tabs );
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

	public function test_get_bar__keeps_the_destinations_of_tabs_and_addons() {
		// Arrange
		$this->register_item( 'elementor-settings', 'Settings' );
		$this->register_item( 'addon-page', 'Addon Page', Menu_Config::THIRD_PARTY_GROUP_ID );

		// Act
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_SETTINGS,
			'group' => Admin_Flow_Config::GROUP_SETTINGS,
			'tab' => 'settings',
		] );

		// Assert
		$this->assertContains( admin_url( 'admin.php?page=elementor-settings' ), array_column( $bar['tabs'], 'url' ) );
		$this->assertSame( [ admin_url( 'admin.php?page=addon-page' ) ], array_column( $bar['addons'], 'url' ) );
	}

	public function test_get_bar__labels_are_plain_text_and_tabs_without_a_label_are_skipped() {
		// Arrange
		$this->register_item( 'elementor-settings', '<b>Settings</b> &amp; More' );
		$this->register_item( 'elementor-tools', '' );

		// Act
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_SETTINGS,
			'group' => Admin_Flow_Config::GROUP_SETTINGS,
			'tab' => 'settings',
		] );

		// Assert
		$this->assertSame( [ 'Settings & More' ], array_column( $bar['tabs'], 'label' ) );
	}

	public function test_get_bar__tabs_carry_the_tag_of_their_item() {
		// Arrange
		$this->register_item( 'elementor-settings', 'Settings' );
		$this->register_tagged_item( 'elementor-tools', 'Tools', '<b>Beta</b>' );

		// Act
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => Admin_Flow_Config::PARENT_SETTINGS,
			'group' => Admin_Flow_Config::GROUP_SETTINGS,
			'tab' => 'settings',
		] );

		// Assert
		$this->assertSame( [ 'settings' => '', 'tools' => 'Beta' ], array_column( $bar['tabs'], 'tag', 'id' ) );
	}

	public function test_get_bar__unknown_parent_falls_back_to_the_default_label() {
		// Arrange
		$this->register_item( 'elementor-settings', 'Settings' );

		// Act
		$bar = $this->secondary_bar->get_bar( $this->create_map(), $this->provider, [
			'parent' => 'unknown-parent',
			'group' => Admin_Flow_Config::GROUP_SETTINGS,
			'tab' => 'settings',
		] );

		// Assert
		$this->assertSame( 'Elementor', $bar['label'] );
	}

	public function test_render_container__prints_the_root_only_when_there_is_a_bar() {
		// Arrange
		$this->act_on_an_editor_one_page();
		$with_bar = $this->create_handler( $this->create_bar() );
		$without_bar = $this->create_handler( [] );

		// Act
		ob_start();
		$with_bar->render_container();
		$html = ob_get_clean();

		ob_start();
		$without_bar->render_container();
		$empty_html = ob_get_clean();

		// Assert
		$this->assertStringStartsWith( '<div id="editor-one-secondary-bar"><nav class="e-one-secondary-bar-placeholder" aria-hidden="true">', $html );
		$this->assertStringEndsWith( '</nav></div>', $html );
		$this->assertSame( '', $empty_html );
	}

	public function test_render_container__prints_the_tabs_as_plain_links_inside_the_root() {
		// Arrange
		$this->act_on_an_editor_one_page();
		$handler = $this->create_handler( [
			'label' => 'Settings',
			'tabs' => [
				[ 'id' => 'settings', 'label' => 'Settings', 'url' => 'https://example.org/wp-admin/admin.php?page=elementor-settings', 'is_active' => true ],
				[ 'id' => 'tools', 'label' => 'Tools', 'url' => 'https://example.org/wp-admin/admin.php?page=elementor-tools', 'is_active' => false ],
			],
			'addons' => [],
		] );

		// Act
		ob_start();
		$handler->render_container();
		$html = ob_get_clean();

		// Assert
		$this->assertStringContainsString(
			'<div class="e-one-secondary-bar-placeholder__tabs">' .
			'<a class="e-one-secondary-bar-placeholder__tab is-active" href="https://example.org/wp-admin/admin.php?page=elementor-settings" tabindex="-1">Settings</a>' .
			'<a class="e-one-secondary-bar-placeholder__tab" href="https://example.org/wp-admin/admin.php?page=elementor-tools" tabindex="-1">Tools</a>' .
			'</div>',
			$html
		);
		$this->assertSame( 1, substr_count( $html, 'is-active' ) );
	}

	public function test_render_container__escapes_the_tab_labels_tags_and_urls() {
		// Arrange
		$this->act_on_an_editor_one_page();
		$handler = $this->create_handler( [
			'label' => 'Settings',
			'tabs' => [
				[
					'id' => 'settings',
					'label' => '<script>alert(1)</script> & More',
					'tag' => '<b>Beta</b>',
					'url' => 'javascript:alert(1)',
					'is_active' => true,
				],
				[
					'id' => 'tools',
					'label' => 'Tools',
					'url' => 'https://example.org/wp-admin/admin.php?page=elementor-tools&tab="x"',
					'is_active' => false,
				],
			],
			'addons' => [],
		] );

		// Act
		ob_start();
		$handler->render_container();
		$html = ob_get_clean();

		// Assert
		$this->assertStringNotContainsString( '<script>', $html );
		$this->assertStringNotContainsString( '<b>', $html );
		$this->assertStringNotContainsString( 'javascript:', $html );
		$this->assertStringNotContainsString( '"x"', $html );
		$this->assertStringContainsString( '&lt;script&gt;alert(1)&lt;/script&gt; &amp; More', $html );
		$this->assertStringContainsString( '<span class="e-one-secondary-bar-placeholder__tag">&lt;b&gt;Beta&lt;/b&gt;</span>', $html );
	}

	public function test_render_container__prints_a_tag_only_for_tabs_that_have_one() {
		// Arrange
		$this->act_on_an_editor_one_page();
		$handler = $this->create_handler( [
			'label' => 'Settings',
			'tabs' => [
				[ 'id' => 'agents', 'label' => 'Agent Ready', 'tag' => 'Beta', 'url' => 'https://example.org/agents', 'is_active' => false ],
				[ 'id' => 'tools', 'label' => 'Tools', 'url' => 'https://example.org/tools', 'is_active' => true ],
			],
			'addons' => [],
		] );

		// Act
		ob_start();
		$handler->render_container();
		$html = ob_get_clean();

		// Assert
		$this->assertStringContainsString( 'Agent Ready<span class="e-one-secondary-bar-placeholder__tag">Beta</span></a>', $html );
		$this->assertSame( 1, substr_count( $html, 'e-one-secondary-bar-placeholder__tag' ) );
	}

	public function test_render_container__reserves_the_addons_and_finder_slots_only_when_they_are_shown() {
		// Arrange
		$this->act_on_an_editor_one_page();
		$bar = $this->create_bar();
		$with_actions = $this->create_handler(
			array_merge( $bar, [ 'addons' => [ [ 'id' => 'addon', 'label' => 'Addon', 'url' => 'https://example.org/addon' ] ] ] ),
			[ 'handle' => Secondary_Bar_Handler::SCRIPT_HANDLE, 'deps' => [] ],
			true
		);
		$without_actions = $this->create_handler( $bar );

		// Act
		ob_start();
		$with_actions->render_container();
		$with_actions_html = ob_get_clean();

		ob_start();
		$without_actions->render_container();
		$without_actions_html = ob_get_clean();

		// Assert
		$this->assertStringContainsString(
			'<div class="e-one-secondary-bar-placeholder__actions">' .
			'<span class="e-one-secondary-bar-placeholder__addons"></span>' .
			'<span class="e-one-secondary-bar-placeholder__finder"></span>' .
			'</div>',
			$with_actions_html
		);
		$this->assertStringContainsString( '<div class="e-one-secondary-bar-placeholder__actions"></div>', $without_actions_html );
	}

	public function test_render_container__prints_nothing_when_the_package_is_missing() {
		// Arrange
		$this->act_on_an_editor_one_page();
		$handler = $this->create_handler( $this->create_bar(), null );

		// Act
		ob_start();
		$handler->render_container();
		$html = ob_get_clean();

		// Assert
		$this->assertSame( '', $html );
	}

	public function test_render_container__prints_only_the_root_outside_editor_one_pages() {
		// Arrange
		$GLOBALS['current_screen'] = \WP_Screen::get( 'post' );
		$handler = $this->create_handler( $this->create_bar() );

		// Act
		ob_start();
		$handler->render_container();
		$html = ob_get_clean();

		// Assert
		$this->assertSame( '<div id="editor-one-secondary-bar"></div>', $html );
	}

	public function test_register_container__renders_at_the_top_of_the_notices() {
		// Arrange
		$handler = $this->create_handler( $this->create_bar() );

		// Act
		$handler->register_container();

		// Assert
		$this->assertSame( PHP_INT_MIN, has_action( 'admin_notices', [ $handler, 'render_container' ] ) );
	}

	public function test_enqueue_assets__enqueues_the_package_with_its_config() {
		// Arrange
		$handler = $this->create_handler( $this->create_bar() );

		// Act
		$handler->enqueue_assets();

		// Assert
		$this->assertTrue( wp_script_is( Secondary_Bar_Handler::SCRIPT_HANDLE, 'enqueued' ) );
		$this->assertContains( 'elementor-common', wp_scripts()->registered[ Secondary_Bar_Handler::SCRIPT_HANDLE ]->deps );
		$this->assertStringContainsString( 'editorOneSecondaryBarConfig', wp_scripts()->get_data( Secondary_Bar_Handler::SCRIPT_HANDLE, 'data' ) );
		$this->assertStringContainsString( '"is_finder_available"', wp_scripts()->get_data( Secondary_Bar_Handler::SCRIPT_HANDLE, 'data' ) );
	}

	public function test_enqueue_assets__does_nothing_without_a_bar() {
		// Arrange
		$handler = $this->create_handler( [] );

		// Act
		$handler->enqueue_assets();

		// Assert
		$this->assertFalse( wp_script_is( Secondary_Bar_Handler::SCRIPT_HANDLE, 'registered' ) );
	}

	private function create_bar(): array {
		return [
			'label' => 'Settings',
			'tabs' => [ [ 'id' => 'settings' ] ],
			'addons' => [],
		];
	}

	private function create_handler( array $bar, ?array $package_config = [ 'handle' => Secondary_Bar_Handler::SCRIPT_HANDLE, 'deps' => [] ], bool $is_finder_available = false ): Secondary_Bar_Handler {
		$secondary_bar = $this->createMock( Secondary_Bar::class );
		$secondary_bar->method( 'get_bar' )->willReturn( $bar );

		$handler = $this->getMockBuilder( Secondary_Bar_Handler::class )
			->setConstructorArgs( [ $this->createMock( Admin_Flow_Handler::class ), $secondary_bar ] )
			->onlyMethods( [ 'get_package_config', 'is_finder_available' ] )
			->getMock();
		$handler->method( 'get_package_config' )->willReturn( $package_config );
		$handler->method( 'is_finder_available' )->willReturn( $is_finder_available );

		$this->handlers[] = $handler;

		return $handler;
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

	private function act_on_an_editor_one_page(): void {
		$GLOBALS['current_screen'] = \WP_Screen::get( 'post' );
		add_filter( 'elementor/editor-one/admin-edit-post-types', [ $this, 'filter_editor_one_post_types' ] );
	}

	public function filter_editor_one_post_types( array $post_types ): array {
		$post_types[] = 'post';

		return $post_types;
	}

	private function register_tagged_item( string $slug, string $label, string $tag ): void {
		$item = new class( $slug, $label, $tag ) implements Menu_Item_Interface, Menu_Item_With_Tag_Interface {
			private string $slug;
			private string $label;
			private string $tag;

			public function __construct( string $slug, string $label, string $tag ) {
				$this->slug = $slug;
				$this->label = $label;
				$this->tag = $tag;
			}

			public function get_capability(): string {
				return 'manage_options';
			}

			public function get_label(): string {
				return $this->label;
			}

			public function get_parent_slug(): string {
				return Menu_Config::ELEMENTOR_MENU_SLUG;
			}

			public function is_visible(): bool {
				return true;
			}

			public function get_position(): int {
				return 10;
			}

			public function get_slug(): string {
				return $this->slug;
			}

			public function get_group_id(): string {
				return 'test-group';
			}

			public function get_tag(): string {
				return $this->tag;
			}
		};

		$this->provider->register_level4_item( $item );
	}

	private function reset_menu_data_provider(): void {
		$reflection = new \ReflectionClass( Menu_Data_Provider::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}
}
