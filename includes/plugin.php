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

	private $classes = [
		'Elementor\Admin' => '/includes/admin.php',
		'Elementor\Api' => '/includes/api.php',
		'Elementor\Beta_Testers' => '/includes/beta-testers.php',
		'Elementor\Compatibility' => '/includes/compatibility.php',
		'Elementor\Conditions' => '/includes/conditions.php',
		'Elementor\Controls_Manager' => '/includes/managers/controls.php',
		'Elementor\Controls_Stack' => '/includes/base/controls-stack.php',
		'Elementor\CSS_File' => '/includes/css-file/css-file.php',
		'Elementor\DB' => '/includes/db.php',
		'Elementor\Editor' => '/includes/editor.php',
		'Elementor\Elements_Manager' => '/includes/managers/elements.php',
		'Elementor\Embed' => '/includes/embed.php',
		'Elementor\Fonts' => '/includes/fonts.php',
		'Elementor\Frontend' => '/includes/frontend.php',
		'Elementor\Global_CSS_File' => '/includes/css-file/global-css-file.php',
		'Elementor\Heartbeat' => '/includes/heartbeat.php',
		'Elementor\Images_Manager' => '/includes/managers/image.php',
		'Elementor\Maintenance' => '/includes/maintenance.php',
		'Elementor\Maintenance_Mode' => '/includes/maintenance-mode.php',
		'Elementor\PageSettings\Manager' => '/includes/page-settings/manager.php',
		'Elementor\Post_CSS_File' => '/includes/css-file/post-css-file.php',
		'Elementor\Posts_CSS_Manager' => '/includes/managers/css-files.php',
		'Elementor\Preview' => '/includes/preview.php',
		'Elementor\Responsive' => '/includes/responsive.php',
		'Elementor\Revisions_Manager' => '/includes/managers/revisions.php',
		'Elementor\Rollback' => '/includes/rollback.php',
		'Elementor\Schemes_Manager' => '/includes/managers/schemes.php',
		'Elementor\Settings' => '/includes/settings/settings.php',
		'Elementor\Settings_Page' => '/includes/settings/settings-page.php',
		'Elementor\Shapes' => '/includes/shapes.php',
		'Elementor\Skins_Manager' => '/includes/managers/skins.php',
		'Elementor\Stylesheet' => '/includes/stylesheet.php',
		'Elementor\System_Info\Main' => '/includes/settings/system-info/main.php',
		'Elementor\TemplateLibrary\Manager' => '/includes/template-library/manager.php',
		'Elementor\Tools' => '/includes/settings/tools.php',
		'Elementor\Tracker' => '/includes/tracker.php',
		'Elementor\Upgrades' => '/includes/upgrades.php',
		'Elementor\User' => '/includes/user.php',
		'Elementor\Utils' => '/includes/utils.php',
		'Elementor\Widgets_Manager' => '/includes/managers/widgets.php',
		'Elementor\WordPress_Widgets_Manager' => '/includes/managers/wordpress-widgets.php',
	];

	private $classes_renames = [
		'Elementor\Debug\Debug' => 'Elementor\Modules\Debug\Debug',
	];

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
		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			new Images_Manager();
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

		$this->wordpress_widgets_manager = new WordPress_Widgets_Manager();

		if ( is_admin() ) {
			$this->admin = new Admin();
			$this->tools = new Tools();
			$this->beta_testers = new Beta_Testers();
		}

		$this->maintenance_mode = new Maintenance_Mode();
	}

	private function add_cpt_support() {
		$cpt_support = get_option( 'elementor_cpt_support', [ 'page', 'post' ] );

		foreach ( $cpt_support as $cpt_slug ) {
			add_post_type_support( $cpt_slug, 'elementor' );
		}
	}

	public function autoload( $class ) {
		if ( 0 !== strpos( $class, __NAMESPACE__ . '\\' ) ) {
			return;
		}

		// Backward Compatibility: Save old class name for set an alias after the new class is loaded
		if ( isset( $this->classes_renames[ $class ] ) ) {
			$old_class = $class;
			$class = $this->classes_renames[ $class ];
		}

		if ( isset( $this->classes[ $class ] ) ) {
			$filename = ELEMENTOR_PATH . $this->classes[ $class ];
		} else {
			$filename = strtolower(
				preg_replace(
					[ '/^' . __NAMESPACE__ . '\\\/', '/([a-z])([A-Z])/', '/_/', '/\\\/' ],
					[ '', '$1-$2', '-', DIRECTORY_SEPARATOR ],
					$class
				)
			);
			$filename = ELEMENTOR_PATH . $filename . '.php';
		}

		if ( is_readable( $filename ) ) {
			require $filename;
		}

		if ( isset( $old_class ) && isset( $this->classes_renames[ $old_class ] ) ) {
			class_alias( $class, $old_class );
		}
	}

	/**
	 * Plugin constructor.
	 */
	private function __construct() {
		spl_autoload_register( [ $this, 'autoload' ] );

		add_action( 'init', [ $this, 'init' ], 0 );

		$this->_includes();
	}
}

if ( ! defined( 'ELEMENTOR_TESTS' ) ) {
	// In tests we run the instance manually.
	Plugin::instance();
}
