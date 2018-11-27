<?php
namespace Elementor;

use Elementor\Core\Admin\Admin;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Common\App as CommonApp;
use Elementor\Core\Common\Modules\Connect\Manager;
use Elementor\Core\Debug\Inspector;
use Elementor\Core\Documents_Manager;
use Elementor\Core\Files\Manager as Files_Manager;
use Elementor\Core\Modules_Manager;
use Elementor\Debug\Debug;
use Elementor\Core\Settings\Manager as Settings_Manager;
use Elementor\Core\Settings\Page\Manager as Page_Settings_Manager;
use Elementor\Modules\History\Revisions_Manager;
use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Elementor plugin.
 *
 * The main plugin handler class is responsible for initializing Elementor. The
 * class registers and all the components required to run the plugin.
 *
 * @since 1.0.0
 */
class Plugin {

	/**
	 * Instance.
	 *
	 * Holds the plugin instance.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @var Plugin
	 */
	public static $instance = null;

	/**
	 * Database.
	 *
	 * Holds the plugin database.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var DB
	 */
	public $db;

	/**
	 * Ajax Manager.
	 *
	 * Holds the plugin ajax manager.
	 *
	 * @since 1.9.0
	 * @deprecated 2.3.0 Use `Plugin::$instance->common->get_component( 'ajax' )` instead
	 * @access public
	 *
	 * @var Ajax
	 */
	public $ajax;

	/**
	 * Controls manager.
	 *
	 * Holds the plugin controls manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Controls_Manager
	 */
	public $controls_manager;

	/**
	 * Debug.
	 *
	 * Holds the plugin debug.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Debug
	 */
	public $debug;

	/**
	 * Documents manager.
	 *
	 * Holds the documents manager.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @var Documents_Manager
	 */
	public $documents;

	/**
	 * Schemes manager.
	 *
	 * Holds the plugin schemes manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Schemes_Manager
	 */
	public $schemes_manager;

	/**
	 * Elements manager.
	 *
	 * Holds the plugin elements manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Elements_Manager
	 */
	public $elements_manager;

	/**
	 * Widgets manager.
	 *
	 * Holds the plugin widgets manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Widgets_Manager
	 */
	public $widgets_manager;

	/**
	 * Revisions manager.
	 *
	 * Holds the plugin revisions manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Revisions_Manager
	 */
	public $revisions_manager;

	/**
	 * Maintenance mode.
	 *
	 * Holds the plugin maintenance mode.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Maintenance_Mode
	 */
	public $maintenance_mode;

	/**
	 * Page settings manager.
	 *
	 * Holds the page settings manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Page_Settings_Manager
	 */
	public $page_settings_manager;

	/**
	 * Dynamic tags manager.
	 *
	 * Holds the dynamic tags manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Dynamic_Tags_Manager
	 */
	public $dynamic_tags;

	/**
	 * Settings.
	 *
	 * Holds the plugin settings.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Settings
	 */
	public $settings;

	/**
	 * Role Manager.
	 *
	 * Holds the plugin Role Manager
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @var \Elementor\Core\RoleManager\Role_Manager
	 */
	public $role_manager;

	/**
	 * Admin.
	 *
	 * Holds the plugin admin.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Admin
	 */
	public $admin;

	/**
	 * Tools.
	 *
	 * Holds the plugin tools.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Tools
	 */
	public $tools;

	/**
	 * Preview.
	 *
	 * Holds the plugin preview.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Preview
	 */
	public $preview;

	/**
	 * Editor.
	 *
	 * Holds the plugin editor.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Editor
	 */
	public $editor;

	/**
	 * Frontend.
	 *
	 * Holds the plugin frontend.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Frontend
	 */
	public $frontend;

	/**
	 * Heartbeat.
	 *
	 * Holds the plugin heartbeat.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Heartbeat
	 */
	public $heartbeat;

	/**
	 * System info.
	 *
	 * Holds the system info data.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var System_Info\Main
	 */
	public $system_info;

	/**
	 * Template library manager.
	 *
	 * Holds the template library manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var TemplateLibrary\Manager
	 */
	public $templates_manager;

	/**
	 * Skins manager.
	 *
	 * Holds the skins manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Skins_Manager
	 */
	public $skins_manager;

	/**
	 * Files Manager.
	 *
	 * Holds the files manager.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @var Files_Manager
	 */
	public $files_manager;

	/**
	 * Files Manager.
	 *
	 * Holds the files manager.
	 *
	 * @since 1.0.0
	 * @access public
	 * @deprecated 2.1.0 Use `Plugin::$files_manager` instead
	 *
	 * @var Files_Manager
	 */
	public $posts_css_manager;

	/**
	 * WordPress widgets manager.
	 *
	 * Holds the WordPress widgets manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var WordPress_Widgets_Manager
	 */
	public $wordpress_widgets_manager;

	/**
	 * Modules manager.
	 *
	 * Holds the modules manager.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Modules_Manager
	 */
	public $modules_manager;

	/**
	 * Beta testers.
	 *
	 * Holds the plugin beta testers.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @var Beta_Testers
	 */
	public $beta_testers;

	/**
	 * @var Inspector
	 * @deprecated 2.1.2 Use $inspector.
	 */
	public $debugger;

	/**
	 * @var Inspector
	 */
	public $inspector;

	/**
	 * @var Manager
	 */
	public $connect;

	/**
	 * @var CommonApp
	 */
	public $common;

	/**
	 * Clone.
	 *
	 * Disable class cloning and throw an error on object clone.
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object. Therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Something went wrong.', 'elementor' ), '1.0.0' );
	}

	/**
	 * Wakeup.
	 *
	 * Disable unserializing of the class.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Something went wrong.', 'elementor' ), '1.0.0' );
	}

	/**
	 * Instance.
	 *
	 * Ensures only one instance of the plugin class is loaded or can be loaded.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return Plugin An instance of the class.
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();

			/**
			 * Elementor loaded.
			 *
			 * Fires when Elementor was fully loaded and instantiated.
			 *
			 * @since 1.0.0
			 */
			do_action( 'elementor/loaded' );
		}

		return self::$instance;
	}

	/**
	 * Init.
	 *
	 * Initialize Elementor Plugin. Register Elementor support for all the
	 * supported post types and initialize Elementor components.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function init() {
		$this->add_cpt_support();

		$this->init_components();

		/**
		 * Elementor init.
		 *
		 * Fires on Elementor init, after Elementor has finished loading but
		 * before any headers are sent.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/init' );
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function on_rest_api_init() {
		// On admin/frontend sometimes the rest API is initialized after the common is initialized.
		if ( ! $this->common ) {
			$this->init_common();
		}
	}

	/**
	 * Init components.
	 *
	 * Initialize Elementor components. Register actions, run setting manager,
	 * initialize all the components that run elementor, and if in admin page
	 * initialize admin components.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function init_components() {
		$this->inspector = new Inspector();
		$this->debugger = $this->inspector;

		Settings_Manager::run();

		$this->db = new DB();
		$this->controls_manager = new Controls_Manager();
		$this->documents = new Documents_Manager();
		$this->schemes_manager = new Schemes_Manager();
		$this->elements_manager = new Elements_Manager();
		$this->widgets_manager = new Widgets_Manager();
		$this->skins_manager = new Skins_Manager();
		$this->files_manager = new Files_Manager();
		/*
		 * @TODO: Remove deprecated alias
		 */
		$this->posts_css_manager = $this->files_manager;
		$this->settings = new Settings();
		$this->tools = new Tools();
		$this->editor = new Editor();
		$this->preview = new Preview();
		$this->frontend = new Frontend();
		$this->debug = new Debug();
		$this->templates_manager = new TemplateLibrary\Manager();
		$this->maintenance_mode = new Maintenance_Mode();
		$this->dynamic_tags = new Dynamic_Tags_Manager();
		$this->modules_manager = new Modules_Manager();
		$this->role_manager = new Core\RoleManager\Role_Manager();
		$this->system_info = new System_Info\Main();
		$this->revisions_manager = new Revisions_Manager();

		User::init();
		Upgrades::add_actions();
		Api::init();
		Tracker::init();

		if ( is_admin() ) {
			$this->heartbeat = new Heartbeat();
			$this->wordpress_widgets_manager = new WordPress_Widgets_Manager();
			$this->admin = new Admin();
			$this->beta_testers = new Beta_Testers();

			if ( Utils::is_ajax() ) {
				new Images_Manager();
			}
		}
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function init_common() {
		$this->common = new CommonApp();

		$this->common->init_components();

		$this->ajax = $this->common->get_component( 'ajax' );
	}

	/**
	 * Add custom post type support.
	 *
	 * Register Elementor support for all the supported post types defined by
	 * the user in the admin screen and saved as `elementor_cpt_support` option
	 * in WordPress `$wpdb->options` table.
	 *
	 * If no custom post type selected, usually in new installs, this method
	 * will return the two default post types: `page` and `post`.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function add_cpt_support() {
		$cpt_support = get_option( 'elementor_cpt_support', [ 'page', 'post' ] );

		foreach ( $cpt_support as $cpt_slug ) {
			add_post_type_support( $cpt_slug, 'elementor' );
		}
	}

	/**
	 * Register autoloader.
	 *
	 * Elementor autoloader loads all the classes needed to run the plugin.
	 *
	 * @since 1.6.0
	 * @access private
	 */
	private function register_autoloader() {
		require ELEMENTOR_PATH . '/includes/autoloader.php';

		Autoloader::run();
	}

	/**
	 * Plugin constructor.
	 *
	 * Initializing Elementor plugin.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function __construct() {
		$this->register_autoloader();

		Maintenance::init();
		Compatibility::register_actions();

		add_action( 'init', [ $this, 'init' ], 0 );
		add_action( 'rest_api_init', [ $this, 'on_rest_api_init' ] );
	}
}

if ( ! defined( 'ELEMENTOR_TESTS' ) ) {
	// In tests we run the instance manually.
	Plugin::instance();
}
