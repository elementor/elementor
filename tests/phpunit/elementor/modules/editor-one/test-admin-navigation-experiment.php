<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\App\Modules\ImportExport\Module as Import_Export_Module;
use Elementor\App\Modules\ImportExportCustomization\Module as Import_Export_Customization_Module;
use Elementor\App\Modules\KitLibrary\AdminMenuItems\Editor_One_Website_Templates_Menu;
use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorOne\Module;
use Elementor\Plugin;
use Elementor\Tools;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Admin_Navigation_Experiment extends Elementor_Test_Base {

	private $original_experiment_default_state;

	public function set_up() {
		parent::set_up();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::ADMIN_NAVIGATION_EXPERIMENT_NAME )['default'];

		set_current_screen( 'dashboard' );
	}

	public function tear_down() {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ADMIN_NAVIGATION_EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		delete_option( Experiments_Manager::OPTION_PREFIX . Module::ADMIN_NAVIGATION_EXPERIMENT_NAME );

		set_current_screen( 'front' );

		parent::tear_down();
	}

	public function test_experiment_is_registered_as_hidden_and_default_inactive() {
		// Arrange
		$data = Module::get_admin_navigation_experimental_data();

		// Act & Assert
		$this->assertSame( Module::ADMIN_NAVIGATION_EXPERIMENT_NAME, $data['name'] );
		$this->assertTrue( $data['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $data['default'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $data['release_status'] );
	}

	public function test_sidebar_navigation_handler_is_loaded_when_experiment_is_inactive() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ADMIN_NAVIGATION_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act
		$module = new Module();

		// Assert
		$this->assertFalse( Module::is_admin_navigation_active() );
		$this->assertNotFalse( $module->get_component( 'sidebar-navigation-handler' ) );
	}

	public function test_sidebar_navigation_handler_is_not_loaded_when_experiment_is_active() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Module::ADMIN_NAVIGATION_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act
		$module = new Module();

		// Assert
		$this->assertTrue( Module::is_admin_navigation_active() );
		$this->assertFalse( $module->get_component( 'sidebar-navigation-handler' ) );
		$this->assertNotFalse( $module->get_component( 'top-bar-handler' ) );
	}

	public function menu_script_data_provider(): array {
		return [
			'experiment inactive' => [ Experiments_Manager::STATE_INACTIVE, true ],
			'experiment active' => [ Experiments_Manager::STATE_ACTIVE, false ],
		];
	}

	/**
	 * @dataProvider menu_script_data_provider
	 */
	public function test_menu_script_is_enqueued_only_when_experiment_is_inactive( string $state, bool $expected_enqueued ) {
		// Arrange
		$this->set_experiment_state( $state );
		wp_dequeue_script( 'editor-one-menu' );
		wp_dequeue_style( 'elementor-admin-menu' );

		// Act
		( new Elementor_One_Menu_Manager() )->enqueue_admin_menu_assets();

		// Assert
		$this->assertSame( $expected_enqueued, wp_script_is( 'editor-one-menu', 'enqueued' ) );
		$this->assertTrue( wp_style_is( 'elementor-admin-menu', 'enqueued' ) );
	}

	public function settings_title_data_provider(): array {
		return [
			'experiment inactive' => [ Experiments_Manager::STATE_INACTIVE, 'Elementor' ],
			'experiment active' => [ Experiments_Manager::STATE_ACTIVE, 'Settings' ],
		];
	}

	/**
	 * @dataProvider settings_title_data_provider
	 */
	public function test_settings_page_title_depends_on_experiment_state( string $state, string $expected_title ) {
		// Arrange
		$this->set_experiment_state( $state );
		$get_page_title = new \ReflectionMethod( Plugin::$instance->settings, 'get_page_title' );
		$get_page_title->setAccessible( true );

		// Act
		$title = $get_page_title->invoke( Plugin::$instance->settings );

		// Assert
		$this->assertSame( $expected_title, $title );
	}

	public function tools_tab_data_provider(): array {
		return [
			'import export, experiment inactive' => [ Import_Export_Module::class, Experiments_Manager::STATE_INACTIVE, 'Website Templates' ],
			'import export, experiment active' => [ Import_Export_Module::class, Experiments_Manager::STATE_ACTIVE, 'Import & Export' ],
			'import export customization, experiment inactive' => [ Import_Export_Customization_Module::class, Experiments_Manager::STATE_INACTIVE, 'Website Templates' ],
			'import export customization, experiment active' => [ Import_Export_Customization_Module::class, Experiments_Manager::STATE_ACTIVE, 'Import & Export' ],
		];
	}

	/**
	 * @dataProvider tools_tab_data_provider
	 */
	public function test_import_export_tools_tab_label_depends_on_experiment_state( string $module_class, string $state, string $expected_label ) {
		// Arrange
		$this->set_experiment_state( $state );
		remove_all_actions( 'elementor/admin/after_create_settings/' . Tools::PAGE_ID );
		$tools = new Tools();

		// Act
		( new $module_class() )->register_settings_tab( $tools );

		// Assert
		$tab = $tools->get_tabs()['import-export-kit'];
		$this->assertSame( $expected_label, html_entity_decode( $tab['label'] ) );
		$this->assertSame( $expected_label, html_entity_decode( $tab['sections']['intro']['label'] ) );
	}

	public function test_website_templates_menu_label_is_unchanged_when_experiment_is_active() {
		// Arrange
		$this->set_experiment_state( Experiments_Manager::STATE_ACTIVE );

		// Act
		$label = ( new Editor_One_Website_Templates_Menu() )->get_label();

		// Assert
		$this->assertSame( 'Website Templates', $label );
	}

	private function set_experiment_state( string $state ): void {
		Plugin::$instance->experiments->set_feature_default_state( Module::ADMIN_NAVIGATION_EXPERIMENT_NAME, $state );
	}
}
