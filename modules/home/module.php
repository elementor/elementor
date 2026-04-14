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

		$site_planner_config = $this->get_site_planner_config();
		if ( $site_planner_config ) {
			$config['site_planner'] = $site_planner_config;
		}

		return $config;
	}

	private function get_site_planner_config(): ?array {
		if ( ! Plugin::$instance->experiments->is_feature_active( 'site-builder' ) ) {
			return null;
		}

		if ( ! Plugin::instance()->common ) {
			return null;
		}

		$connect = Plugin::instance()->common->get_component( 'connect' );

		if ( ! $connect ) {
			return null;
		}

		$app = $connect->get_app( 'library' );

		if ( ! $app || ! $app->is_connected() ) {
			return null;
		}

		$access_token = $app->get( 'access_token' );
		$client_id = $app->get( 'client_id' );
		$home_url = trailingslashit( home_url() );
		$site_key = $app->get_site_key();
		$access_token_secret = $app->get( 'access_token_secret' );

		$connect_data = [
			'access-token' => $access_token,
			'app' => 'library',
			'client-id' => $client_id,
			'home-url' => $home_url,
			'site-key' => $site_key,
		];

		ksort( $connect_data );

		$signature = hash_hmac(
			'sha256',
			wp_json_encode( $connect_data, JSON_NUMERIC_CHECK ),
			$access_token_secret
		);

		$api_origin = defined( 'ELEMENTOR_SITE_PLANNER_API_ORIGIN' )
			? ELEMENTOR_SITE_PLANNER_API_ORIGIN
			: 'https://my.elementor.com/api/v2/ai';

		$site_builder_url = defined( 'ELEMENTOR_SITE_BUILDER_IFRAME_URL' )
			? ELEMENTOR_SITE_BUILDER_IFRAME_URL
			: 'https://planner.elementor.com/chat.html';

		return [
			'connectAuth' => [
				'signature' => $signature,
				'accessToken' => $access_token,
				'clientId' => $client_id,
				'homeUrl' => $home_url,
				'siteKey' => $site_key,
			],
			'apiOrigin' => $api_origin,
			'siteBuilderUrl' => $site_builder_url,
		];
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
