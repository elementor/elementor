<?php
namespace Elementor;

use Elementor\Debug\Debug;
use Elementor\PageSettings\Manager as PageSettingsManager;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Main class plugin
 */
class Plugin {

	/**
	 * @var Plugin
	 */
	public static $instance = null;

	/**
	 * @var DB
	 */
	public $db;

	/**
	 * @var Controls_Manager
	 */
	public $controls_manager;

	/**
	 * @var Debug
	 */
	public $debug;

	/**
	 * @var Schemes_Manager
	 */
	public $schemes_manager;

	/**
	 * @var Elements_Manager
	 */
	public $elements_manager;

	/**
	 * @var Widgets_Manager
	 */
	public $widgets_manager;

	/**
	 * @var Revisions_Manager
	 */
	public $revisions_manager;

	/**
	 * @var Maintenance_Mode
	 */
	public $maintenance_mode;

	/**
	 * @var PageSettingsManager
	 */
	public $page_settings_manager;

	/**
	 * @var Settings
	 */
	public $settings;

	/**
	 * @var Preview
	 */
	public $preview;

	/**
	 * @var Editor
	 */
	public $editor;

	/**
	 * @var Frontend
	 */
	public $frontend;

	/**
	 * @var Heartbeat
	 */
	public $heartbeat;

	/**
	 * @var System_Info\Main
	 */
	public $system_info;

	/**
	 * @var TemplateLibrary\Manager
	 */
	public $templates_manager;

	/**
	 * @var Skins_Manager
	 */
	public $skins_manager;

	/**
	 * @var Posts_CSS_Manager
	 */
	public $posts_css_manager;

	/**
	 * @deprecated
	 *
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
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			do_action( 'elementor/loaded' );
		}

		return self::$instance;
	}

	/**
	 * Register the CPTs with our Editor support.
	 */
	public function init() {
		$this->add_cpt_support();

		$this->init_components();

		do_action( 'elementor/init' );
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
		include( ELEMENTOR_PATH . 'includes/base/controls-stack.php' );
		include( ELEMENTOR_PATH . 'includes/managers/controls.php' );
		include( ELEMENTOR_PATH . 'includes/managers/schemes.php' );
		include( ELEMENTOR_PATH . 'includes/managers/elements.php' );
		include( ELEMENTOR_PATH . 'includes/managers/widgets.php' );
		include( ELEMENTOR_PATH . 'includes/managers/skins.php' );
		include( ELEMENTOR_PATH . 'includes/settings/settings.php' );
		include( ELEMENTOR_PATH . 'includes/settings/tools.php' );
		include( ELEMENTOR_PATH . 'includes/editor.php' );
		include( ELEMENTOR_PATH . 'includes/preview.php' );
		include( ELEMENTOR_PATH . 'includes/frontend.php' );
		include( ELEMENTOR_PATH . 'includes/heartbeat.php' );
		include( ELEMENTOR_PATH . 'includes/responsive.php' );
		include( ELEMENTOR_PATH . 'includes/stylesheet.php' );

		include( ELEMENTOR_PATH . 'includes/settings/system-info/main.php' );
		include( ELEMENTOR_PATH . 'includes/tracker.php' );
		include( ELEMENTOR_PATH . 'includes/template-library/manager.php' );

		include( ELEMENTOR_PATH . 'includes/managers/css-files.php' );
		include( ELEMENTOR_PATH . 'includes/managers/revisions.php' );
		include( ELEMENTOR_PATH . 'includes/page-settings/manager.php' );
		include( ELEMENTOR_PATH . 'includes/css-file/css-file.php' );
		include( ELEMENTOR_PATH . 'includes/css-file/post-css-file.php' );
		include( ELEMENTOR_PATH . 'includes/css-file/global-css-file.php' );
		include( ELEMENTOR_PATH . 'includes/conditions.php' );
		include( ELEMENTOR_PATH . 'includes/shapes.php' );
		include( ELEMENTOR_PATH . 'includes/debug/debug.php' );
		include( ELEMENTOR_PATH . 'includes/maintenance-mode.php' );

		if ( is_admin() ) {
			include( ELEMENTOR_PATH . 'includes/admin.php' );

			if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
				include( ELEMENTOR_PATH . 'includes/managers/image.php' );
			}
		}
	}

	private function init_components() {
		$this->db = new DB();

		$this->controls_manager = new Controls_Manager();
		$this->schemes_manager = new Schemes_Manager();
		$this->elements_manager = new Elements_Manager();
		$this->widgets_manager = new Widgets_Manager();
		$this->skins_manager = new Skins_Manager();
		$this->posts_css_manager = new Posts_CSS_Manager();
		$this->revisions_manager = new Revisions_Manager();
		$this->page_settings_manager = new PageSettingsManager();

		$this->settings = new Settings();
		$this->editor = new Editor();
		$this->preview = new Preview();
		$this->frontend = new Frontend();
		$this->debug = new Debug();

		$this->heartbeat = new Heartbeat();
		$this->system_info = new System_Info\Main();

		$this->templates_manager = new TemplateLibrary\Manager();

		$this->maintenance_mode = new Maintenance_Mode();

		if ( is_admin() ) {
			new Admin();
			new Tools();
		}
	}

	private function add_cpt_support() {
		$cpt_support = get_option( 'elementor_cpt_support', [ 'page', 'post' ] );

		foreach ( $cpt_support as $cpt_slug ) {
			add_post_type_support( $cpt_slug, 'elementor' );
		}
	}

	/**
	 * Plugin constructor.
	 */
	private function __construct() {
		add_action( 'init', [ $this, 'init' ], 0 );

		$this->_includes();
	}
}

if ( ! defined( 'ELEMENTOR_TESTS' ) ) {
	// In tests we run the instance manually.
	Plugin::instance();
}
