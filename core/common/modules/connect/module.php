<?php
namespace Elementor\Core\Common\Modules\Connect;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Apps\Base_App;
use Elementor\Core\Common\Modules\Connect\Apps\Connect;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function get_name() {
		return 'connect';
	}

	/**
	 * @var array
	 */
	protected $registered_apps = [];

	/**
	 * Apps Instances.
	 *
	 * Holds the list of all the apps instances.
	 *
	 * @since 2.3.0
	 * @access protected
	 *
	 * @var Base_App[]
	 */
	protected $apps = [];

	/**
	 * Registered apps categories.
	 *
	 * Holds the list of all the registered apps categories.
	 *
	 * @since 2.3.0
	 * @access protected
	 *
	 * @var array
	 */
	protected $categories = [];

	protected $admin_page;

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function __construct() {
		$this->registered_apps = [
			'connect' => Connect::get_class_name(),
		];

		// Note: The priority 11 is for allowing plugins to add their register callback on elementor init.
		add_action( 'elementor/init', [ $this, 'init' ], 11 );

		wp_register_script(
			'elementor-connect',
			$this->get_js_assets_url( 'connect', '/core/common/modules/connect/assets/js/' ),
			[
				'jquery',
			],
			ELEMENTOR_VERSION,
			true
		);
	}

	/**
	 * Register default apps.
	 *
	 * Registers the default apps.
	 *
	 * @since 2.3.0
	 * @access public
	 */
	public function init() {
		if ( is_admin() ) {
			$this->admin_page = new Admin();
		}

		/**
		 * Register Elementor apps.
		 *
		 * Fires after Elementor registers the default apps.
		 *
		 * @since 2.3.0
		 *
		 * @param self $this The apps manager instance.
		 */
		do_action( 'elementor/connect/apps/register', $this );

		foreach ( $this->registered_apps as $slug => $class ) {
			$this->apps[ $slug ] = new $class();
		}
	}

	/**
	 * Register app.
	 *
	 * Registers an app.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @param string $slug App slug.
	 * @param string $class App full class name.
	 *
	 * @return self The updated apps manager instance.
	 */
	public function register_app( $slug, $class ) {
		$this->registered_apps[ $slug ] = $class;

		return $this;
	}

	/**
	 * Get app instance.
	 *
	 * Retrieve the app instance.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @param $slug
	 *
	 * @return Base_App|null
	 */
	public function get_app( $slug ) {
		if ( isset( $this->apps[ $slug ] ) ) {
			return $this->apps[ $slug ];
		}

		return null;
	}

	/**
	 * @since 2.3.0
	 * @access public
	 * @return Base_App[]
	 */
	public function get_apps() {
		return $this->apps;
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function register_category( $slug, $args ) {
		$this->categories[ $slug ] = $args;
		return $this;
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function get_categories() {
		return $this->categories;
	}

}
