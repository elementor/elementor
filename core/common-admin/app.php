<?php
namespace Elementor\Core\CommonAdmin;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\CommonAdmin\Modules\Ajax\Module as Ajax;
use Elementor\Core\CommonAdmin\Modules\Finder\Module as Finder;
use Elementor\Core\CommonAdmin\Modules\Connect\Module as Connect;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * App
 *
 * Elementor's common-admin app that groups shared functionality, components and configuration
 */
class App extends BaseApp {

	/**
	 * App constructor.
	 */
	public function __construct() {
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );

		add_action( 'elementor/editor/before_enqueue_styles', [ $this, 'register_styles' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'register_styles' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_styles' ], 9 );
	}

	/**
	 * Init components
	 *
	 * Initializing common components.
	 */
	public function init_components() {
		$this->add_component( 'ajax', new Ajax() );

		if ( current_user_can( 'manage_options' ) ) {
			if ( ! is_customize_preview() ) {
				$this->add_component( 'finder', new Finder() );
			}
		}

		$this->add_component( 'connect', new Connect() );
	}

	/**
	 * Get name.
	 *
	 * Retrieve the app name.
	 *
	 * @return string Common app name.
	 */
	public function get_name() {
		return 'common-admin';
	}

	/**
	 * Register scripts.
	 *
	 * Register common-admin scripts.
	 */
	public function register_scripts() {
		wp_enqueue_script(
			'elementor-common-admin',
			$this->get_js_assets_url( 'common-admin' ),
			[
				'wp-api-request',
				'elementor-common',
			],
			ELEMENTOR_VERSION,
			true
		);

		$this->print_config();

		// Used for external plugins.
		do_action( 'elementor/common/after_register_scripts', $this );
	}

	/**
	 * Register styles.
	 *
	 * Register common styles.
	 */
	public function register_styles() {
		wp_enqueue_style(
			'elementor-common-admin',
			$this->get_css_assets_url( 'common-admin', null, 'default', true ),
			[
				'elementor-common',
			],
			ELEMENTOR_VERSION
		);
	}

	/**
	 * Get init settings.
	 *
	 * Define the default/initial settings of the common-admin app.
	 *
	 */
	protected function get_init_settings() {
		return [
			'activeModules' => array_keys( $this->get_components() ),
		];
	}
}
