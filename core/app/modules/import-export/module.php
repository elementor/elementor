<?php
namespace Elementor\App\Modules\ImportExport;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * This App class exists for backwards compatibility with 3rd parties.
 *
 * @deprecated 3.8.0
 */
class Module extends BaseModule {

	/**
	 * @deprecated 3.8.0
	 */
	const VERSION = '1.0.0';

	/**
	 * @var mixed
	 * @deprecated 3.8.0
	 */
	public $import;

	/**
	 * @deprecated 3.8.0
	 */
	public function get_name() {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.8.0' );

		return 'import-export-bc';
	}
}
