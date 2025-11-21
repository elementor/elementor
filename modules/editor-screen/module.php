<?php
namespace Elementor\Modules\EditorScreen;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Settings;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {

	const PAGE_ID = 'editor_screen';

	public function get_name(): string {
		return 'editor';
	}

	public function __construct() {
		parent::__construct();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$admin_menu->register( static::PAGE_ID, new Admin_Menu_App() );
		}, 0 );

		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
				add_action( "admin_print_scripts-{$hooks[ static::PAGE_ID ]}", [ $this, 'enqueue_home_screen_scripts' ] );
			}
		}, 10, 2 );

		add_filter( 'elementor/document/urls/edit', [ $this, 'add_active_document_to_edit_link' ] );
	}

	public function enqueue_home_screen_scripts(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			'e-editor-screen',
			ELEMENTOR_ASSETS_URL . 'js/e-editor-screen' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( 'e-editor-screen', 'elementor' );

		wp_localize_script(
			'e-editor-screen',
			'elementorEditorScreenData',
			$this->get_app_js_config()
		);
	}

	public function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::PAGE_ID );
	}

	public function add_active_document_to_edit_link( $edit_link ) {
		$active_document = Utils::get_super_global_value( $_GET, 'active-document' ) ?? null;
		$active_tab = Utils::get_super_global_value( $_GET, 'active-tab' ) ?? null;

		if ( $active_document ) {
			$edit_link = add_query_arg( 'active-document', $active_document, $edit_link );
		}

		if ( $active_tab ) {
			$edit_link = add_query_arg( 'active-tab', $active_tab, $edit_link );
		}

		return $edit_link;
	}

	public static function get_experimental_data(): array {
		return [
			'name' => static::PAGE_ID,
			'title' => esc_html__( 'Elementor Editor Screen', 'elementor' ),
			'description' => esc_html__( 'Default Elementor menu page.', 'elementor' ),
			'hidden' => true,
			'release_status' => Experiments_Manager::RELEASE_STATUS_STABLE,
			'default' => Experiments_Manager::STATE_ACTIVE,
		];
	}

	private function get_app_js_config(): array {
		$editor_assets_api = new EditorAssetsAPI( $this->get_api_config() );
		$api = new API( $editor_assets_api );

		return $api->get_home_screen_items();
	}

	private function get_api_config(): array {
		return [
			EditorAssetsAPI::ASSETS_DATA_URL => 'https://assets.elementor.com/home-screen/v1/home-screen.json',
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => '_elementor_editor_screen_data',
			EditorAssetsAPI::ASSETS_DATA_KEY => 'home-screen',
		];
	}
}
