<?php
namespace Elementor\Core\Common\Modules\Connect;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Utils;
use Elementor\Modules\EditorOne\Classes\Editor_One_Menu_Item;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin {

	const PAGE_ID = 'elementor-connect';

	public static $url = '';

	private function get_valid_redirect_to_from_request() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Only reading a URL parameter.
		$raw = Utils::get_super_global_value( $_GET, 'redirect_to' );

		if ( ! $raw ) {
			return '';
		}

		$raw = esc_url_raw( $raw );

		$validated = wp_validate_redirect( $raw, '' );
		if ( ! $validated ) {
			return '';
		}

		$admin_host = wp_parse_url( admin_url(), PHP_URL_HOST );
		$dest_host  = wp_parse_url( $validated, PHP_URL_HOST );
		if ( $dest_host && $admin_host && ! hash_equals( $admin_host, $dest_host ) ) {
			return '';
		}

		return $validated;
	}

	public function register_admin_menu( Admin_Menu_Manager $admin_menu ) {
		if ( ! $this->is_editor_one_active() ) {
			$admin_menu->register( static::PAGE_ID, new Connect_Menu_Item() );
		}
	}

	public function register_editor_one_menu( Menu_Data_Provider $menu_data_provider ) {
		$connect_item = new Connect_Menu_Item();
		$editor_one_connect = new Editor_One_Menu_Item( $connect_item, '', static::PAGE_ID );
		$menu_data_provider->register_level4_item(
			$editor_one_connect->get_slug(),
			$editor_one_connect,
			Menu_Config::SYSTEM_GROUP_ID
		);
	}

	private function is_editor_one_active(): bool {
		return !! Plugin::instance()->modules_manager->get_modules( 'editor-one' );
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function on_load_page() {
		if ( ! $this->user_has_enough_permissions() ) {
			wp_die( 'You do not have sufficient permissions to access this page.', 'You do not have sufficient permissions to access this page.', [
				'back_link' => true,
			] );
		}

		// Allow a per-request default landing URL when provided via a safe `redirect_to` parameter.
		$maybe_redirect_to = $this->get_valid_redirect_to_from_request();
		if ( $maybe_redirect_to ) {
			self::$url = $maybe_redirect_to;
		}

		if ( isset( $_GET['action'], $_GET['app'] ) ) {
			$manager = Plugin::$instance->common->get_component( 'connect' );

			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$app_slug = Utils::get_super_global_value( $_GET, 'app' );
			$app = $manager->get_app( $app_slug );

			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$action = Utils::get_super_global_value( $_GET, 'action' );

			$nonce_action = $app_slug . $action;

			if ( ! $app ) {
				wp_die( 'Unknown app: ' . esc_attr( $app_slug ) );
			}

			if ( ! wp_verify_nonce( Utils::get_super_global_value( $_GET, 'nonce' ), $nonce_action ) ) {
				wp_die( 'Invalid Nonce', 'Invalid Nonce', [
					'back_link' => true,
				] );
			}

			$method = 'action_' . $action;

			if ( method_exists( $app, $method ) ) {
				call_user_func( [ $app, $method ] );
			}
		}
	}

	private function user_has_enough_permissions() {
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		if ( 'library' === Utils::get_super_global_value( $_GET, 'app' ) ) {
			return current_user_can( 'edit_posts' );
		}

		return false;
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function __construct() {
		self::$url = admin_url( 'admin.php?page=' . self::PAGE_ID );

		add_action( 'elementor/admin/menu/register', [ $this, 'register_admin_menu' ] );

		add_action( 'elementor/editor-one/menu/register', [ $this, 'register_editor_one_menu' ] );

		add_action( 'elementor/editor-one/menu/excluded_level3_slugs', function ( array $excluded_slugs ): array {
			$excluded_slugs[] = static::PAGE_ID;
			return $excluded_slugs;
		} );

		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
				add_action( 'load-' . $hooks[ static::PAGE_ID ], [ $this, 'on_load_page' ] );
			}
		}, 10, 2 );

		add_action( 'elementor/editor-one/menu/after_register_hidden_submenus', function ( array $hooks ) {
			if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
				add_action( 'load-' . $hooks[ static::PAGE_ID ], [ $this, 'on_load_page' ] );
			}
		} );
	}
}
