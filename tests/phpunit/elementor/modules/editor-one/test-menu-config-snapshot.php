<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\App\Modules\KitLibrary\Module as KitLibraryModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
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
		$this->set_request_uri();
	}

	public function tearDown(): void {
		parent::tearDown();

		$this->reset_menu_data_provider();
		$this->restore_screen_context();
		$this->deactivate_editor_one_experiment();
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

	private function activate_editor_one_experiment(): void {
		$experiments = Plugin::instance()->experiments;
		$experiments->set_feature_default_state(
			EditorOneModule::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
	}

	private function deactivate_editor_one_experiment(): void {
		$experiments = Plugin::instance()->experiments;
		$experiments->set_feature_default_state(
			EditorOneModule::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
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
			parse_str( $parsed['query'], $query_params );
			if ( isset( $query_params['return_to'] ) && '' === $query_params['return_to'] ) {
				unset( $query_params['return_to'] );
			}

			unset( $query_params['ver'] );
			unset( $query_params['return_to'] );
			
			if ( ! empty( $query_params ) ) {
				$path .= '?' . http_build_query( $query_params );
			}
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

	private function set_request_uri(): void {
		if ( ! isset( $_SERVER['REQUEST_URI'] ) ) {
			$_SERVER['REQUEST_URI'] = '';
		}
	}
}
