<?php
namespace Elementor\Modules\Home;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Settings;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {

	const PAGE_ID = 'home_screen';

	public function get_name(): string {
		return 'home';
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/document/urls/edit', [ $this, 'add_active_document_to_edit_link' ] );
	}

	public function enqueue_home_screen_scripts(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			'e-home-screen',
			ELEMENTOR_ASSETS_URL . 'js/e-home-screen' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( 'e-home-screen', 'elementor' );

		wp_localize_script(
			'e-home-screen',
			'elementorHomeScreenData',
			$this->get_app_js_config()
		);

		wp_enqueue_style(
			'e-home-screen',
			$this->get_css_assets_url( 'modules/home/e-home-screen' ),
			[],
			ELEMENTOR_VERSION
		);
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

	private function get_app_js_config(): array {
		$editor_assets_api = new EditorAssetsAPI( $this->get_api_config() );
		$api = new API( $editor_assets_api );

		$config = $api->get_home_screen_items();

		return $config;
	}

	private function get_api_config(): array {
		return [
			EditorAssetsAPI::ASSETS_DATA_URL => 'https://broken-assets.elementor.com/home-screen/v1/home-screen.json',
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => '_elementor_home_screen_data',
			EditorAssetsAPI::ASSETS_DATA_KEY => 'home-screen',
		];
	}

	public static function get_elementor_settings_page_id(): string {
		return 'elementor-settings';
	}
}
