<?php
namespace Elementor\App\Modules\KitLibrary;

use Elementor\App\Modules\KitLibrary\Data\Repository;
use Elementor\App\Modules\KitLibrary\Module as KitLibrary;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Admin\Menu\Main as MainMenu;
use Elementor\Core\Utils\Exceptions;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\App\Modules\KitLibrary\Connect\Kit_Library;
use Elementor\App\Modules\KitLibrary\Connect\Cloud_Kits;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\App\Modules\KitLibrary\Data\Kits\Controller as Kits_Controller;
use Elementor\App\Modules\KitLibrary\Data\Taxonomies\Controller as Taxonomies_Controller;
use Elementor\App\Modules\KitLibrary\Data\CloudKits\Controller as Cloud_Kits_Controller;
use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Utils as ElementorUtils;
use Elementor\App\Modules\ImportExport\Module as ImportExport_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	/**
	 * Get name.
	 *
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'kit-library';
	}

	private function register_admin_menu( MainMenu $menu ) {
		$menu->add_submenu( [
			'page_title' => esc_html__( 'Kit Library', 'elementor' ),
			'menu_title' => '<span id="e-admin-menu__kit-library">' . esc_html__( 'Kit Library', 'elementor' ) . '</span>',
			'menu_slug' => Plugin::$instance->app->get_base_url() . '#/kit-library',
			'index' => 40,
		] );
	}

	/**
	 * Register the admin menu the old way.
	 */
	private function register_admin_menu_legacy( Admin_Menu_Manager $admin_menu ) {
		$admin_menu->register(
			Plugin::$instance->app->get_base_url() . '#/kit-library',
			new Kit_Library_Menu_Item()
		);
	}

	private function set_kit_library_settings() {
		if ( ! Plugin::$instance->common ) {
			return;
		}

		/** @var ConnectModule $connect */
		$connect = Plugin::$instance->common->get_component( 'connect' );

		/** @var Kit_Library $kit_library */
		$kit_library = $connect->get_app( 'kit-library' );

		Plugin::$instance->app->set_settings( 'kit-library', [
			'has_access_to_module' => current_user_can( 'manage_options' ),
			'subscription_plans' => $this->apply_filter_subscription_plans( $connect->get_subscription_plans( 'kit-library' ) ),
			'is_pro' => false,
			'is_library_connected' => $kit_library->is_connected(),
			'library_connect_url'  => $kit_library->get_admin_url( 'authorize', [
				'utm_source' => 'kit-library',
				'utm_medium' => 'wp-dash',
				'utm_campaign' => 'library-connect',
				'utm_term' => '%%page%%', // Will be replaced in the frontend.
			] ),
			'access_level' => ConnectModule::ACCESS_LEVEL_CORE,
			'access_tier' => ConnectModule::ACCESS_TIER_FREE,
			'app_url' => Plugin::$instance->app->get_base_url() . '#/' . $this->get_name(),
		] );
	}

	private function apply_filter_subscription_plans( array $subscription_plans ): array {
		foreach ( $subscription_plans as $key => $plan ) {
			if ( null === $plan['promotion_url'] ) {
				continue;
			}

			$subscription_plans[ $key ] = Filtered_Promotions_Manager::get_filtered_promotion_data(
				$plan,
				'elementor/kit_library/' . $key . '/promotion',
				'promotion_url'
			);
		}

		return $subscription_plans;
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		Plugin::$instance->data_manager_v2->register_controller( new Kits_Controller() );
		Plugin::$instance->data_manager_v2->register_controller( new Taxonomies_Controller() );
		Plugin::$instance->data_manager_v2->register_controller( new Cloud_Kits_Controller() );
	}

	public function register_actions() {
		// Assigning this action here since the repository is being loaded by demand.
		add_action( 'elementor/experiments/feature-state-change/container', [ Repository::class, 'clear_cache' ], 10, 0 );

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$this->register_admin_menu_legacy( $admin_menu );
		}, Source_Local::ADMIN_MENU_PRIORITY + 30 );

		add_action( 'elementor/connect/apps/register', function ( ConnectModule $connect_module ) {
			$connect_module->register_app( 'kit-library', Kit_Library::get_class_name() );

			if ( Plugin::$instance->experiments->is_feature_active( 'cloud-library' ) ) {
				$connect_module->register_app( 'cloud-kits', Cloud_Kits::get_class_name() );
			}
		} );

		add_action( 'elementor/init', function () {
			$this->set_kit_library_settings();
		}, 12 /** After the initiation of the connect kit library */ );

		if ( Plugin::$instance->experiments->is_feature_active( 'cloud-library' ) ) {
			add_action( 'template_redirect', [ $this, 'handle_kit_screenshot_generation' ] );
			add_filter('elementor/import-export/export-result', [ $this, 'handle_export_kit_result' ] );
			add_filter('elementor/import/kit/result/cloud', [ $this, 'handle_import_kit_from_cloud' ] );
		}
	}

	public function handle_export_kit_result( $result, $source, $export, $settings, $file ) {
		if ( ImportExport_Module::EXPORT_SOURCE_CLOUD !== $source ) {
			return $result;
		}

		unset( $result['file'] );

		$raw_screen_shot = base64_decode( substr( $settings['screenShotBlob'], strlen( 'data:image/png;base64,' ) ) );
		$title = $export['manifest']['title'];
		$description = $export['manifest']['description'];

		$kit = KitLibrary::get_cloud_app()->create_kit(
			$title,
			$description,
			$file,
			$raw_screen_shot,
			$settings['include'],
		);

		if ( is_wp_error( $kit ) ) {
			return $kit;
		}

		$result['kit'] = $kit;

		return $result;
	}
	public function handle_kit_screenshot_generation() {
		$is_kit_preview = ElementorUtils::get_super_global_value( $_GET, 'kit_thumbnail' );
		$nonce = ElementorUtils::get_super_global_value( $_GET, 'nonce' );

		if ( $is_kit_preview ) {
			if ( ! wp_verify_nonce( $nonce, 'kit_thumbnail' ) ) {
				wp_die( esc_html__( 'Not Authorized', 'elementor' ), esc_html__( 'Error', 'elementor' ), 403 );
			}

			$suffix = ( ElementorUtils::is_script_debug() || ElementorUtils::is_elementor_tests() ) ? '' : '.min';

			show_admin_bar( false );

			wp_enqueue_script(
				'dom-to-image',
				ELEMENTOR_ASSETS_URL . "/lib/dom-to-image/js/dom-to-image{$suffix}.js",
				[],
				'2.6.0',
				true
			);

			wp_enqueue_script(
				'html2canvas',
				ELEMENTOR_ASSETS_URL . "/lib/html2canvas/js/html2canvas{$suffix}.js",
				[],
				'1.4.1',
				true
			);

			wp_enqueue_script(
				'cloud-library-screenshot',
				ELEMENTOR_ASSETS_URL . "/js/cloud-library-screenshot{$suffix}.js",
				[ 'dom-to-image', 'html2canvas', 'elementor-common', 'elementor-common-modules' ],
				ELEMENTOR_VERSION,
				true
			);

			$config = [
				'home_url' => home_url(),
				'kit_id' => uniqid(),
				'selector' => 'body',
			];

			wp_add_inline_script( 'cloud-library-screenshot', 'var ElementorScreenshotConfig = ' . wp_json_encode( $config ) . ';' );
		}
	}

	public static function get_cloud_app(): Cloud_Kits {
		$cloud_kits_app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-kits' );

		if ( ! $cloud_kits_app ) {
			$error_message = esc_html__( 'Cloud-Kits is not instantiated.', 'elementor' );

			throw new \Exception( $error_message, Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return $cloud_kits_app;
	}

	protected function handle_import_kit_from_cloud( $args ) {
		$kit = self::get_cloud_app()->get_kit( [
			'id' => $args['kit_id'],
		] );

		if ( is_wp_error( $kit ) ) {
			return $kit;
		}

		if ( empty( $kit['downloadUrl'] ) ) {
			throw new \Error( ImportExport_Module::KIT_LIBRARY_ERROR_KEY ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return [
			'file_name' => self::get_remote_kit_zip( $kit['downloadUrl'] ),
			'referrer' => ImportExport_Module::REFERRER_CLOUD,
			'file_url' => $kit['downloadUrl'],
		];
	}
	public static function get_remote_kit_zip( $url ) {
		$remote_zip_request = wp_safe_remote_get( $url );

		if ( is_wp_error( $remote_zip_request ) ) {
			Plugin::$instance->logger->get_logger()->error( $remote_zip_request->get_error_message() );
			throw new \Error( ImportExport_Module::KIT_LIBRARY_ERROR_KEY ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( 200 !== $remote_zip_request['response']['code'] ) {
			Plugin::$instance->logger->get_logger()->error( $remote_zip_request['response']['message'] );
			throw new \Error( ImportExport_Module::KIT_LIBRARY_ERROR_KEY ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return Plugin::$instance->uploads_manager->create_temp_file( $remote_zip_request['body'], 'kit.zip' );
	}
}
