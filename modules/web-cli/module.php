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
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );
	}

	public function register_scripts() {
		wp_register_script(
			'web-cli',
			$this->get_js_assets_url( 'web-cli' ),
			[
				'elementor-common-modules',
			],
			ELEMENTOR_VERSION,
			true
		);
	}
}
