<?php
namespace Elementor\App\Modules\SiteBuilder;

use Elementor\App\Modules\Onboarding\Module as OnboardingModule;
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
	}

	private function register_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => 'site-builder',
			'title' => esc_html__( 'Site Builder', 'elementor' ),
			'description' => esc_html__( 'Enable Site Builder.', 'elementor' ),
			'release_status' => Plugin::$instance->experiments::RELEASE_STATUS_DEV,
			'hidden' => true,
		] );
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
			'siteTitle' => get_bloginfo( 'name' ),
			'siteAbout' => $this->get_site_about(),
			'siteIdentifier' => Site_Identity::get_id(),
		];

		$connect_auth = $this->get_connect_auth();

		if ( $connect_auth ) {
			$settings['connectAuth'] = $connect_auth;
		}

		Plugin::$instance->app->set_settings( 'site-builder', $settings );
	}

	private const SITE_ABOUT_TRANSLATION_KEYS = [
		'small_business' => 'steps.site_about.option_small_med_business',
		'online_store' => 'steps.site_about.option_online_store',
		'company_site' => 'steps.site_about.option_company_site',
		'blog' => 'steps.site_about.option_blog',
		'landing_page' => 'steps.site_about.option_landing_page',
		'booking' => 'steps.site_about.option_booking',
		'organization' => 'steps.site_about.option_organization',
		'other' => 'steps.site_about.option_other',
	];

	private function get_site_about(): array {
		$choices = get_option( 'elementor_onboarding_choices', [] );
		$keys = $choices['site_about'] ?? [];

		if ( empty( $keys ) ) {
			return [];
		}

		$strings = OnboardingModule::get_translated_strings();

		return array_map( function ( $key ) use ( $strings ) {
			$translation_key = self::SITE_ABOUT_TRANSLATION_KEYS[ $key ] ?? '';

			return $strings[ $translation_key ] ?? $key;
		}, $keys );
	}

	private function get_iframe_url(): string {
		if ( defined( 'ELEMENTOR_SITE_BUILDER_IFRAME_URL' ) ) {
			return ELEMENTOR_SITE_BUILDER_IFRAME_URL;
		}

		return 'https://planner.elementor.com/chat.html';
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
