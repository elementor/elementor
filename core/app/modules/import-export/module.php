<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\App\Modules\ImportExport\Module as Import_Export_Module;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * This App class was introduced for backwards compatibility with 3rd parties.
 */
class Module extends BaseModule {

	const VERSION = '1.0.0';

	public $import;

	public function get_name() {
		return 'import-export-bc';
	}
}
