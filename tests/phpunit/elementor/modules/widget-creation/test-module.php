<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WidgetCreation;

use Elementor\Modules\WidgetCreation\Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Elementor_Test_Base {

	const ANGIE_PLUGIN_FILE = 'angie/angie.php';

	public function set_up() {
		parent::set_up();

		remove_all_filters( 'pre_option_active_plugins' );
		remove_all_filters( 'elementor/editor/v2/packages' );
		remove_all_filters( 'elementor/editor/localize_settings' );
	}

	public function tear_down() {
		remove_all_filters( 'pre_option_active_plugins' );
		wp_set_current_user( 0 );

		parent::tear_down();
	}

	public function data_access_cases(): array {
		return [
			'admin with Angie active' => [ true, true, true ],
			'admin with Angie inactive' => [ true, false, false ],
			'non-admin with Angie active' => [ false, true, false ],
			'non-admin with Angie inactive' => [ false, false, false ],
		];
	}

	/**
	 * @dataProvider data_access_cases
	 */
	public function test_can_create_widget( bool $is_admin, bool $is_angie_active, bool $expected ) {
		// Arrange
		$this->arrange_access( $is_admin, $is_angie_active );

		// Act & Assert
		$this->assertSame( $is_angie_active, Module::is_angie_plugin_active() );
		$this->assertSame( $expected, Module::can_create_widget() );
	}

	/**
	 * @dataProvider data_access_cases
	 */
	public function test_localize_settings_expose_widget_creation_access( bool $is_admin, bool $is_angie_active, bool $expected ) {
		// Arrange
		$this->arrange_access( $is_admin, $is_angie_active );
		new Module();

		// Act
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertSame(
			[
				'isAngiePluginActive' => $is_angie_active,
				'canCreateWidget' => $expected,
			],
			$settings['widgetCreation']
		);
	}

	/**
	 * @dataProvider data_access_cases
	 */
	public function test_editor_widget_creation_package_loads_only_when_allowed( bool $is_admin, bool $is_angie_active, bool $expected ) {
		// Arrange
		$this->arrange_access( $is_admin, $is_angie_active );
		new Module();

		// Act
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );

		// Assert
		$this->assertSame( $expected, in_array( 'editor-widget-creation', $packages, true ) );
	}

	private function arrange_access( bool $is_admin, bool $is_angie_active ): void {
		$user = $is_admin
			? $this->factory()->create_and_get_administrator_user()
			: $this->factory()->user->create_and_get( [ 'role' => 'subscriber' ] );

		wp_set_current_user( $user->ID );

		$active_plugins = $is_angie_active ? [ PLUGIN_PATH, self::ANGIE_PLUGIN_FILE ] : [ PLUGIN_PATH ];

		add_filter( 'pre_option_active_plugins', static fn() => $active_plugins );
	}
}
