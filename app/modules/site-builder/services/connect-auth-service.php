<?php
namespace Elementor\App\Modules\SiteBuilder\Services;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Connect_Auth_Service {

	public function get_connect_auth(): ?array {
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
			(string) $access_token_secret
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
