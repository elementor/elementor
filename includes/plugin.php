<?php
namespace Elementor;

use Elementor\Core\Modules_Manager;
use Elementor\Debug\Debug;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Core\Settings\Page\Manager as PageSettingsManager;
use Elementor\Modules\History\Revisions_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main plugin class.
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
	 * @var Admin
	 */
	public $admin;
	/**
	 * @var Tools
	 */
	public $tools;

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
	 * @var WordPress_Widgets_Manager
	 */
	public $wordpress_widgets_manager;

	/**
	 * @var Modules_Manager
	 */
	private $modules_manager;

	/**
	 * @var Beta_Testers
	 */
	public $beta_testers;

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
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'elementor' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'elementor' ), '1.0.0' );
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

	private function init_components() {
		Compatibility::register_actions();
		SettingsManager::run();

		$this->db = new DB();
		$this->controls_manager = new Controls_Manager();
		$this->schemes_manager = new Schemes_Manager();
		$this->elements_manager = new Elements_Manager();
		$this->widgets_manager = new Widgets_Manager();
		$this->skins_manager = new Skins_Manager();
		$this->posts_css_manager = new Posts_CSS_Manager();
		$this->settings = new Settings();
		$this->editor = new Editor();
		$this->preview = new Preview();
		$this->frontend = new Frontend();
		$this->debug = new Debug();
		$this->templates_manager = new TemplateLibrary\Manager();
		$this->maintenance_mode = new Maintenance_Mode();
		$this->modules_manager = new Modules_Manager();

		Api::init();
		Tracker::init();

		if ( is_admin() ) {
			$this->revisions_manager = new Revisions_Manager();
			$this->heartbeat = new Heartbeat();
			$this->wordpress_widgets_manager = new WordPress_Widgets_Manager();
			$this->system_info = new System_Info\Main();
			$this->admin = new Admin();
			$this->tools = new Tools();
			$this->beta_testers = new Beta_Testers();

			if ( Utils::is_ajax() ) {
				new Images_Manager();
			}
		}
	}

	private function add_cpt_support() {
		$cpt_support = get_option( 'elementor_cpt_support', [ 'page', 'post' ] );

		foreach ( $cpt_support as $cpt_slug ) {
			add_post_type_support( $cpt_slug, 'elementor' );
		}
	}

	private function register_autoloader() {
		require ELEMENTOR_PATH . '/includes/autoloader.php';

		Autoloader::run();
	}

	/**
	 * Plugin constructor.
	 */
	private function __construct() {
		$this->register_autoloader();

		add_action( 'init', [ $this, 'init' ], 0 );
	}
}

if ( ! defined( 'ELEMENTOR_TESTS' ) ) {
	// In tests we run the instance manually.
	Plugin::instance();
}
