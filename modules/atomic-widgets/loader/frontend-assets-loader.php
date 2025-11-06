<?php
namespace Elementor\Modules\AtomicWidgets\Loader;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Frontend_Assets_Loader {
	const ALPINEJS_HANDLE = 'elementor-v2-alpinejs';
	const FRONTEND_HANDLERS_HANDLE = 'elementor-v2-frontend-handlers';

	/**
	 * @return void
	 */
	public function register_scripts() {
		$this->register_package_scripts();

		do_action( 'elementor/atomic-widgets/frontend/loader/scripts/register', $this );
	}

	private function register_package_scripts() {
		$assets_url = ELEMENTOR_ASSETS_URL;
		$min_suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			self::FRONTEND_HANDLERS_HANDLE,
			"{$assets_url}js/packages/frontend-handlers/frontend-handlers{$min_suffix}.js",
			[ 'jquery' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_register_script(
			self::ALPINEJS_HANDLE,
			"{$assets_url}js/packages/alpinejs/alpinejs{$min_suffix}.js",
			[],
			ELEMENTOR_VERSION,
			true
		);
	}
}
