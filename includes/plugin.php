<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Main class plugin
 */
class Plugin {

	/**
	 * @var Plugin
	 */
	private static $_instance = null;

	/**
	 * @return string
	 */
	public function get_version() {
		return ELEMENTOR_VERSION;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'elementor' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'elementor' ), '1.0.0' );
	}

	/**
	 * @return Plugin
	 */
	public static function instance() {
		if ( is_null( self::$_instance ) ) {
			self::$_instance = new self();
		}
		return self::$_instance;
	}

	/**
	 * Register the CPTs with our Editor support.
	 */
	public function init() {
		$cpt_support = get_option( 'elementor_cpt_support', [ 'page', 'post' ] );

		foreach ( $cpt_support as $cpt_slug ) {
			add_post_type_support( $cpt_slug, 'elementor' );
		}
	}

	private function _includes() {
		include( ELEMENTOR_PATH . 'includes/maintenance.php' );
		include( ELEMENTOR_PATH . 'includes/upgrades.php' );
		include( ELEMENTOR_PATH . 'includes/api.php' );
		include( ELEMENTOR_PATH . 'includes/utils.php' );
		include( ELEMENTOR_PATH . 'includes/user.php' );
		include( ELEMENTOR_PATH . 'includes/fonts.php' );
		include( ELEMENTOR_PATH . 'includes/compatibility.php' );

		include( ELEMENTOR_PATH . 'includes/db.php' );
		include( ELEMENTOR_PATH . 'includes/controls-manager.php' );
		include( ELEMENTOR_PATH . 'includes/schemes-manager.php' );
		include( ELEMENTOR_PATH . 'includes/elements-manager.php' );
		include( ELEMENTOR_PATH . 'includes/widgets-manager.php' );
		include( ELEMENTOR_PATH . 'includes/settings/settings.php' );
		include( ELEMENTOR_PATH . 'includes/editor.php' );
		include( ELEMENTOR_PATH . 'includes/preview.php' );
		include( ELEMENTOR_PATH . 'includes/frontend.php' );
		include( ELEMENTOR_PATH . 'includes/heartbeat.php' );

		include( ELEMENTOR_PATH . 'includes/settings/system-info/main.php' );
		include( ELEMENTOR_PATH . 'includes/tracker.php' );
		include( ELEMENTOR_PATH . 'includes/template-library/manager.php' );

		if ( is_admin() ) {
			include( ELEMENTOR_PATH . 'includes/admin.php' );
		}
	}

	/**
	 * Plugin constructor.
	 */
	private function __construct() {
		add_action( 'init', [ $this, 'init' ] );

		// TODO: Declare this fields
		$this->_includes();

		$this->db = new DB();
		$this->controls_manager = new Controls_Manager();
		$this->schemes_manager = new Schemes_Manager();
		$this->elements_manager = new Elements_Manager();
		$this->widgets_manager = new Widgets_Manager();

		$settings = new Settings();

		$this->editor = new Editor();
		$this->preview = new Preview();

		$this->frontend = new Frontend();
		$heartbeat = new Heartbeat();

		$this->system_info = new System_Info\Main();
		$this->templates_manager = new TemplateLibrary\Manager();

		if ( is_admin() ) {
			new Admin();
		}
	}
}

if ( ! defined( 'ELEMENTOR_TESTS' ) ) {
	// In tests we run the instance manually.
	Plugin::instance();
}
