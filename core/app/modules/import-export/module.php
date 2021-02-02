<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Plugin;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Import Export Module
 *
 * Responsible for initializing Elementor App functionality
 */
class Module extends BaseModule {
	const FORMAT_VERSION = '1.0';

	const EXPORT_TRIGGER_KEY = 'elementor_export_kit';

	const IMPORT_TRIGGER_KEY = 'elementor_import_kit';

	/**
	 * @var Export
	 */
	private $export;

	/**
	 * @var Import
	 */
	private $import;

	/**
	 * Get name.
	 *
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'import-export';
	}

	public function get_init_settings() {
		$export_nonce = wp_create_nonce( 'elementor_export' );
		$export_url = add_query_arg( [ 'nonce' => $export_nonce ], admin_url() );

		return [
			'exportURL' => $export_url,
		];
	}

	private function on_elementor_init() {
		if ( isset( $_POST['action'] ) && self::IMPORT_TRIGGER_KEY === $_POST['action'] ) {
			if ( ! wp_verify_nonce( $_POST['nonce'], Ajax::NONCE_KEY ) ) {
				return;
			}

			$this->import = new Import( json_decode( stripslashes( $_POST['data'] ), true ) );

			$result = $this->import->run();

			wp_send_json_success( $result );
		}

		if ( isset( $_GET[ self::EXPORT_TRIGGER_KEY ] ) ) {
			if ( ! wp_verify_nonce( $_GET['nonce'], 'elementor_export' ) ) {
				return;
			}

			$export_settings = $_GET[ self::EXPORT_TRIGGER_KEY ];

			$this->export = new Export( self::merge_properties( [], $export_settings, [ 'include' ] ) );

			$this->export->run();
		}
	}

	private function register_admin_menu() {
		add_submenu_page(
			Settings::PAGE_ID,
			'',
			__( 'Export', 'elementor' ),
			'manage_options',
			Plugin::$instance->app->get_base_url() . '#/export'
		);

		add_submenu_page(
			Settings::PAGE_ID,
			'',
			__( 'Import', 'elementor' ),
			'manage_options',
			Plugin::$instance->app->get_base_url() . '#/import'
		);
	}

	public function __construct() {
		add_action( 'elementor/init', function() {
			$this->on_elementor_init();
		} );

		add_action( 'admin_menu', function() {
			$this->register_admin_menu();
		}, 206 ); // Below Elementor/Tools
	}
}
