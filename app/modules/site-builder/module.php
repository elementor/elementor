<?php
namespace Elementor\App\Modules\SiteBuilder;

use Elementor\App\Modules\SiteBuilder\Connect\App;
use Elementor\App\Modules\SiteBuilder\Rest\Rest_Api;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'site-builder';
	}

	public function __construct() {
		parent::__construct();

		$this->register_experiment();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		add_action( 'elementor/init', [ $this, 'on_elementor_init' ], 12 );

		add_action( 'elementor/connect/apps/register', function ( $connect_module ) {
			$connect_module->register_app( 'site-builder', App::get_class_name() );
		} );

		add_action( 'rest_api_init', function () {
			( new Rest_Api() )->register_routes();
		} );
	}

	private function register_experiment() {
		Plugin::instance()->experiments->add_feature([
			'name' => 'site-builder',
			'title' => esc_html__( 'Site Builder', 'elementor' ),
			'description' => esc_html__( 'Enable Site Builder.', 'elementor' ),
			'release_status' => Plugin::$instance->experiments::RELEASE_STATUS_DEV,
			'hidden' => true,
		]);
	}

	private function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( 'site-builder' );
	}

	public function on_elementor_init() {
		if ( ! Plugin::instance()->app->is_current() ) {
			return;
		}

		$settings = [
			'iframeUrl' => $this->get_iframe_url(),
			'isAdmin' => current_user_can( 'manage_options' ),
			'elementorAiCurrentContext' => $this->get_elementor_ai_current_context(),
		];

		$connect_auth = $this->get_connect_auth();

		if ( $connect_auth ) {
			$settings['connectAuth'] = $connect_auth;
		}

		Plugin::$instance->app->set_settings( 'site-builder', $settings );
	}

	private function get_elementor_ai_current_context(): array {
		$choices = get_option( 'elementor_onboarding_choices', [] );
		$site_about = $choices['site_about'] ?? [];
		return [
			'siteTitle' => (string) get_bloginfo( 'name' ),
			'siteAbout' => $site_about,
		];
	}

	private function get_iframe_url(): string {
		if ( defined( 'ELEMENTOR_SITE_BUILDER_IFRAME_URL' ) ) {
			return ELEMENTOR_SITE_BUILDER_IFRAME_URL;
		}

		return 'https://planner.elementor.com/chat.html';
	}

	public function get_config(): ?array {
		if ( ! $this->is_experiment_active() ) {
			return null;
		}

		$connect_auth = $this->get_connect_auth();

		if ( ! $connect_auth ) {
			return null;
		}

		return [
			'siteKey' => $connect_auth['siteKey'],
		];
	}

	private function get_connect_auth(): ?array {
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

		return [
			'signature' => $signature,
			'accessToken' => $access_token,
			'clientId' => $client_id,
			'homeUrl' => $home_url,
			'siteKey' => $site_key,
		];
	}
}
