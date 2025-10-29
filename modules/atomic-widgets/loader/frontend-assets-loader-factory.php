<?php
namespace Elementor\Modules\AtomicWidgets\Loader;

use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Core\Utils\Collection;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Frontend_Assets_Loader_Factory {
	/**
	 * @return Frontend_Assets_Loader
	 */
	public static function create() {
		$config = new Collection( [
			'assets_url' => ELEMENTOR_ASSETS_URL,
			'min_suffix' => ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min',
		] );

		$assets_config_provider = ( new Assets_Config_Provider() )
			->set_path_resolver( function ( $name ) {
				return ELEMENTOR_ASSETS_PATH . "js/packages/{$name}/{$name}.asset.php";
			} );

		return new Frontend_Assets_Loader( $config, $assets_config_provider );
	}
}
