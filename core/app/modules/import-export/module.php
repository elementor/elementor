<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;

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

	public function __construct() {
		add_action( 'elementor/init', [ $this, 'on_elementor_init' ] );
		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}

	public function on_elementor_init() {
		if ( isset( $_GET[ self::EXPORT_TRIGGER_KEY ] ) ) {
			$this->export = new Export();
		}
	}

	public function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( self::IMPORT_TRIGGER_KEY, function() {
			return $this->import = new Import();
		} );
	}

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
}
