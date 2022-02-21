<?php
namespace Elementor\Modules\WebCli;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public function get_name() {
		return 'web-cli';
	}

	public function __construct() {
		// TODO: move to hook
		wp_register_script(
			'web-cli',
			$this->get_js_assets_url( 'web-cli' ),
			[],
			ELEMENTOR_VERSION,
			true
		);
	}
}
