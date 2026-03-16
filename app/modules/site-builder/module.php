<?php
namespace Elementor\App\Modules\SiteBuilder;

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

		add_action( 'elementor/init', [ $this, 'on_elementor_init' ], 12 );
	}

	public function on_elementor_init() {
		if ( ! Plugin::instance()->app->is_current() ) {
			return;
		}

		$settings = [
			'wpRestUrl' => esc_url_raw( rest_url() ),
			'nonce' => wp_create_nonce( 'wp_rest' ),
		];

		$connect_auth = $this->get_connect_auth();

		if ( $connect_auth ) {
			$settings['connectAuth'] = $connect_auth;
		}

		Plugin::$instance->app->set_settings( 'site-builder', $settings );
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

		// Must match the hardcoded values in the AI API's auth.service.ts validateConnectAuth()
		$connect_data = [
			'access-token' => $access_token,
			'app' => 'library',
			'client-id' => $client_id,
			'endpoint' => 'text\\completion',
			'home-url' => $home_url,
			'local-id' => '1',
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
