<?php
namespace Elementor\App\Modules\ImportExport;

use Elementor\App\Modules\ImportExport\Module as Import_Export_Module;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * This App class exists for backwards compatibility with 3rd parties.
 *
 * @deprecated 3.8.0
 */
class Module extends BaseModule {

	const VERSION = '1.0.0';

	public $import;

	public function get_name() {
		return 'import-export-bc';
	}
}
