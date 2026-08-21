<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Regression coverage for the Elementor Settings page (`elementor-settings`) being
 * registered as a WP admin page under two different parents at once, which made
 * WordPress fire its render callback twice on a single request.
 */
class Test_Elementor_One_Menu_Manager_Settings_Page extends Elementor_Test_Base {

	private array $original_menu;

	private array $original_submenu;

	public function setUp(): void {
		parent::setUp();

		global $menu, $submenu, $admin_page_hooks, $_registered_pages, $_parent_pages;

		$this->original_menu = $menu ?? [];
		$this->original_submenu = $submenu ?? [];

		$menu = [];
		$submenu = [];
		$admin_page_hooks = [];
		$_registered_pages = [];
		$_parent_pages = [];

		$this->act_as_admin();
	}

	public function tearDown(): void {
		parent::tearDown();

		global $menu, $submenu;

		$menu = $this->original_menu;
		$submenu = $this->original_submenu;
	}

	public function test_settings_page_is_registered_exactly_once_after_admin_menu() {
		// Act.
		do_action( 'admin_menu' );

		// Assert.
		global $_parent_pages;

		$slug = Settings::SETTINGS_PAGE_ID;

		$this->assertSame(
			1,
			$this->count_slug_occurrences_in_submenu( $slug ),
			'The elementor-settings page should appear as an admin submenu item exactly once.'
		);

		$registered_parent = $_parent_pages[ $slug ] ?? null;
		$this->assertNotNull( $registered_parent, 'The elementor-settings page should be registered as an admin page.' );

		$hook = get_plugin_page_hookname( $slug, $registered_parent );

		$this->assertSame(
			1,
			$this->count_registered_callbacks( $hook ),
			'Only one render callback should be attached to the elementor-settings page hook, otherwise the page renders twice.'
		);
	}

	private function count_slug_occurrences_in_submenu( string $slug ): int {
		global $submenu;

		$count = 0;

		foreach ( $submenu as $items ) {
			foreach ( $items as $item ) {
				if ( $slug === ( $item[2] ?? '' ) ) {
					$count++;
				}
			}
		}

		return $count;
	}

	private function count_registered_callbacks( string $hook ): int {
		global $wp_filter;

		if ( empty( $wp_filter[ $hook ] ) ) {
			return 0;
		}

		$count = 0;

		foreach ( $wp_filter[ $hook ]->callbacks as $callbacks ) {
			$count += count( $callbacks );
		}

		return $count;
	}
}
