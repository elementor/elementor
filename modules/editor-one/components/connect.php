<?php
namespace Elementor\Modules\EditorOne\Components;

use ElementorOne\Connect\Facade;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Connect {

	const PLUGIN_SLUG = 'elementor';
	const APP_NAME = 'elementor';
	const APP_PREFIX = 'elementor';
	const APP_REST_NAMESPACE = 'elementor';
	const BASE_URL = 'https://my.elementor.com/connect';
	const ADMIN_PAGE = 'elementor-settings';
	const APP_TYPE = 'app_access';
	const SCOPES = 'openid offline_access share_usage_data';
	const STATE_NONCE = 'elementor_auth_nonce';
	const CONNECT_MODE = 'site';
	private static ?Connect $instance = null;

	public static function instance(): Connect {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Check if the plugin is connected
	 */
	public static function is_connected(): bool {
		$facade = self::get_connect();
		$access_token = $facade->data()->get_access_token();
		return (bool) $access_token && $facade->utils()->is_valid_home_url();
	}

	/**
	 * Get the Connect Facade instance
	 */
	public static function get_connect(): Facade {
		return Facade::get( self::PLUGIN_SLUG );
	}

	public function __construct() {
		// Initialize the Connect Facade with your configuration
		Facade::make( [
			'app_name'           => self::APP_NAME,
			'app_prefix'         => self::APP_PREFIX,
			'app_rest_namespace' => self::APP_REST_NAMESPACE,
			'base_url'           => self::BASE_URL,
			'admin_page'         => self::ADMIN_PAGE,
			'app_type'           => self::APP_TYPE,
			'plugin_slug'        => self::PLUGIN_SLUG,
			'scopes'             => self::SCOPES,
			'state_nonce'        => self::STATE_NONCE,
			'connect_mode'       => self::CONNECT_MODE,
		] );
	}
}
