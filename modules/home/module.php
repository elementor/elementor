<?php
namespace Elementor\Modules\Home;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Modules\Home\Rest\Site_Planner_Proxy;
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

		add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
		add_filter( 'elementor/document/urls/edit', [ $this, 'add_active_document_to_edit_link' ] );
	}

	public function register_rest_routes(): void {
		( new Site_Planner_Proxy() )->register_routes();
	}

	public function enqueue_fonts(): void {
		wp_enqueue_style(
			'elementor-onboarding-fonts',
			'https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap',
			[],
			ELEMENTOR_VERSION
		);
	}

	public function enqueue_home_screen_scripts(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$this->enqueue_fonts();

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

		$config['wpRestNonce'] = wp_create_nonce( 'wp_rest' );

		$site_planner_config = $this->get_site_planner_config();
		if ( $site_planner_config ) {
			$config['site_planner'] = $site_planner_config;
		}

		return $config;
	}

	private function get_site_planner_config(): ?array {
		$site_builder = Plugin::$instance->app->get_component( 'site-builder' );

		if ( ! $site_builder ) {
			return null;
		}

		$planner_config = $site_builder->get_planner_config();

		if ( ! $planner_config ) {
			return null;
		}

		return array_merge( $planner_config, [
			'siteBuilderUrl' => $planner_config['iframeUrl'],
			'apiOrigin'      => defined( 'ELEMENTOR_SITE_PLANNER_API_ORIGIN' )
				? ELEMENTOR_SITE_PLANNER_API_ORIGIN
				: 'https://my.elementor.com/api/v2/ai',
			'previewImage1'  => ELEMENTOR_ASSETS_URL . 'images/site-planner-01.jpg',
			'previewImage2'  => ELEMENTOR_ASSETS_URL . 'images/site-planner-02.jpg',
			'bgImage'        => ELEMENTOR_ASSETS_URL . 'images/site-planner-bg.png',
		] );
	}

	private function get_api_config(): array {
		return [
			EditorAssetsAPI::ASSETS_DATA_URL => 'https://assets.elementor.com/home-screen/v1/home-screen.json',
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => '_elementor_home_screen_data',
			EditorAssetsAPI::ASSETS_DATA_KEY => 'home-screen',
		];
	}

	public static function get_elementor_settings_page_id(): string {
		return 'elementor-settings';
	}
}
