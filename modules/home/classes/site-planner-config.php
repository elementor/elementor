<?php
namespace Elementor\Modules\Home\Classes;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Site_Planner_Config {

	public function get(): ?array {
		if ( ! $this->is_experiment_active() ) {
			return null;
		}

		$common = $this->get_common();

		if ( ! $common ) {
			return null;
		}

		$connect = $common->get_component( 'connect' );

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
			'previewImage' => ELEMENTOR_ASSETS_URL . 'images/site-planner-preview.png',
			'bgImage' => ELEMENTOR_ASSETS_URL . 'images/site-planner-bg.png',
		];
	}

	protected function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( 'site-builder' );
	}

	protected function get_common() {
		return Plugin::instance()->common;
	}
}
