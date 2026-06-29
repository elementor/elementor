<?php
namespace Elementor\App\Modules\SiteBuilder;

use Elementor\App\Modules\SiteBuilder\Connect\App;
use Elementor\App\Modules\SiteBuilder\Rest\Rest_Api;
use Elementor\App\Modules\SiteBuilder\Services\Connect_Auth_Service;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Module as Connect_Module;
use Elementor\Plugin;
use Elementor\Utils;

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
			'exitTo' => admin_url( 'admin.php?page=elementor' ),
			'elementorAiCurrentContext' => $this->get_elementor_ai_current_context(),
			'isConnected' => $this->is_user_connected(),
			'isPro' => Utils::has_pro(),
			'accessLevel' => Utils::has_pro() ? Connect_Module::ACCESS_LEVEL_PRO : Connect_Module::ACCESS_LEVEL_CORE,
			'accessTier' => Utils::has_pro() ? Connect_Module::ACCESS_TIER_PRO_LEGACY : Connect_Module::ACCESS_TIER_FREE,
		];

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

	private function is_user_connected(): bool {
		if ( ! Plugin::instance()->common ) {
			return false;
		}

		$connect = Plugin::instance()->common->get_component( 'connect' );

		if ( ! $connect ) {
			return false;
		}

		$library = $connect->get_app( 'library' );

		return $library ? $library->is_connected() : false;
	}

	public function get_config(): ?array {
		if ( ! $this->is_experiment_active() ) {
			return null;
		}

		$connect_auth = ( new Connect_Auth_Service() )->get_connect_auth();

		if ( ! $connect_auth ) {
			return [];
		}

		return [
			'siteKey' => $connect_auth['siteKey'],
		];
	}
}
