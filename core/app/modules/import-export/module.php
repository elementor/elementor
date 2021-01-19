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
		return [
			'custom_post_types' => [
				'post' => 'Posts',
				'page' => 'Pages',
			],
		];
	}

	private function on_elementor_init() {
		if ( isset( $_GET[ self::EXPORT_TRIGGER_KEY ] ) ) {
			$this->export = new Export();
		}
	}

	private function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( self::IMPORT_TRIGGER_KEY, function() {
			return $this->import = new Import();
		} );
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
		add_action( 'elementor/ajax/register_actions', function( Ajax $ajax ) {
			$this->register_ajax_actions( $ajax );
		} );

		add_action( 'admin_menu', function() {
			$this->register_admin_menu();
		}, 206 ); // Below Elementor/Tools
	}
}
