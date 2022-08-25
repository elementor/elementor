<?php
namespace Elementor\Core\App\Modules\KitLibrary;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * This App class was introduced for backwards compatibility with 3rd parties.
 */
class Module extends BaseModule {

	const VERSION = '1.0.0';

	public function get_name() {
		return 'kit-library-bc';
	}
}
