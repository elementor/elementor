<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Admin_Flow_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Components\Admin_Flow_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Admin_Flow_Handler extends Elementor_Test_Base {

	private array $original_globals = [];

	public function setUp(): void {
		parent::setUp();

		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		foreach ( $this->get_menu_global_names() as $name ) {
			$this->original_globals[ $name ] = $GLOBALS[ $name ] ?? null;
		}
	}

	public function tearDown(): void {
		foreach ( $this->original_globals as $name => $value ) {
			$GLOBALS[ $name ] = $value;
		}

		parent::tearDown();
	}

	public function hidden_legacy_parent_data_provider(): array {
		return [
			'legacy templates list' => [
				'edit.php',
				'elementor_library',
				null,
				Admin_Flow_Config::PARENT_TEMPLATES,
			],
			'legacy home page' => [
				'admin.php',
				'',
				Menu_Config::ELEMENTOR_MENU_SLUG,
				Admin_Flow_Config::PARENT_HOME,
			],
		];
	}

	/**
	 * @dataProvider hidden_legacy_parent_data_provider
	 */
	public function test_filter_parent_file__survives_wordpress_parent_detection( string $pagenow, string $typenow, ?string $plugin_page, string $active_parent ) {
		// Arrange
		$this->set_menu_globals( $pagenow, $typenow, $plugin_page );
		$handler = $this->create_handler_with_active_parent( $active_parent );

		// Act
		$GLOBALS['parent_file'] = $handler->filter_parent_file( $GLOBALS['parent_file'] );
		$detected_parent = get_admin_page_parent();

		// Assert
		$this->assertSame( Menu_Config::ELEMENTOR_HOME_MENU_SLUG, $detected_parent );
		$this->assertSame( Menu_Config::ELEMENTOR_HOME_MENU_SLUG, $GLOBALS['parent_file'] );
	}

	public function test_filter_parent_file__keeps_unmapped_pages_untouched() {
		// Arrange
		$this->set_menu_globals( 'edit.php', 'elementor_library', null );
		$handler = $this->create_handler_with_active_parent( '' );

		// Act
		$parent_file = $handler->filter_parent_file( 'edit.php?post_type=elementor_library' );

		// Assert
		$this->assertSame( 'edit.php?post_type=elementor_library', $parent_file );
		$this->assertEmpty( $GLOBALS['_wp_real_parent_file'] );
	}

	private function set_menu_globals( string $pagenow, string $typenow, ?string $plugin_page ): void {
		$GLOBALS['menu'] = [
			[ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_HOME_MENU_SLUG ],
			[ 'Elementor', 'manage_options', Menu_Config::ELEMENTOR_MENU_SLUG ],
			[ 'Templates', 'edit_posts', Menu_Config::LEGACY_TEMPLATES_SLUG ],
		];
		$GLOBALS['submenu'] = [
			Menu_Config::ELEMENTOR_HOME_MENU_SLUG => [
				[ 'Editor', 'edit_posts', Menu_Config::ELEMENTOR_MENU_SLUG ],
			],
			Menu_Config::LEGACY_TEMPLATES_SLUG => [
				[ 'Saved Templates', 'edit_posts', Menu_Config::LEGACY_TEMPLATES_SLUG ],
			],
		];
		$GLOBALS['pagenow'] = $pagenow;
		$GLOBALS['typenow'] = $typenow;
		$GLOBALS['plugin_page'] = $plugin_page;
		$GLOBALS['parent_file'] = null;
		$GLOBALS['_wp_real_parent_file'] = [];
		$GLOBALS['_wp_menu_nopriv'] = [];
		$GLOBALS['_wp_submenu_nopriv'] = [];
	}

	private function create_handler_with_active_parent( string $active_parent ): Admin_Flow_Handler {
		$handler = new Admin_Flow_Handler();
		$property = new \ReflectionProperty( Admin_Flow_Handler::class, 'active_state' );
		$property->setAccessible( true );
		$property->setValue( $handler, [
			'parent' => $active_parent,
			'group' => '',
			'tab' => '',
		] );

		return $handler;
	}

	private function get_menu_global_names(): array {
		return [ 'menu', 'submenu', 'pagenow', 'typenow', 'plugin_page', 'parent_file', '_wp_real_parent_file', '_wp_menu_nopriv', '_wp_submenu_nopriv' ];
	}
}
