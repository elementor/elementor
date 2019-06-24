<?php
namespace Elementor\System_Info;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;
use Elementor\System_Info\Helpers\Model_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor main system info page.
 *
 * Elementor main system info page handler class responsible for creating system info
 * reports and displaying them on WordPress dashboard under Elementor setting.
 *
 * @since 1.0.0
 */
class Main {

	/**
	 * Required user capabilities.
	 *
	 * Holds the user capabilities required to manage Elementor menus.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var string
	 */
	private $capability = 'manage_options';

	/**
	 * System info settings.
	 *
	 * Holds the settings required for Elementor system info page.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var array
	 */
	private $settings = [];

	/**
	 * Elementor system info reports.
	 *
	 * Holds an array of available reports in Elementor system info page.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var array
	 */
	private static $reports = [
		'server' => [],
		'wordpress' => [],
		'theme' => [],
		'user' => [],
		'plugins' => [],
		'network_plugins' => [],
		'mu_plugins' => [],
	];

	/**
	 * Main system info page constructor.
	 *
	 * Initializing Elementor system info page.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		$this->require_files();
		$this->init_settings();
		$this->add_actions();
	}

	/**
	 * Require files.
	 *
	 * Require the needed files for Elementor system info page.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function require_files() {
		require __DIR__ . '/classes/abstracts/base-reporter.php';
		require __DIR__ . '/helpers/model-helper.php';
	}

	/**
	 * Create a report.
	 *
	 * Register a new report that will be displayed in Elementor system info page.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $properties Report properties.
	 *
	 * @return \WP_Error|false|Base_Reporter Base_Reporter instance if the report was created,
	 *                                       False or WP_Error otherwise.
	 */
	public function create_reporter( array $properties ) {
		$properties = Model_Helper::prepare_properties( $this->get_settings( 'reporter_properties' ), $properties );

		$reporter_class = $properties['class_name'] ? $properties['class_name'] : $this->get_reporter_class( $properties['name'] );

		$reporter = new $reporter_class( $properties );

		if ( ! ( $reporter instanceof Base_Reporter ) ) {
			return new \WP_Error( 'Each reporter must to be an instance or sub-instance of `Base_Reporter` class.' );
		}

		if ( ! $reporter->is_enabled() ) {
			return false;
		}

		return $reporter;
	}

	/**
	 * Add actions.
	 *
	 * Register filters and actions for the main system info page.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function add_actions() {
		add_action( 'admin_menu', [ $this, 'register_menu' ], 500 );
		add_action( 'wp_ajax_elementor_system_info_download_file', [ $this, 'download_file' ] );
	}

	/**
	 * Display page.
	 *
	 * Output the content for the main system info page.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function display_page() {
		$reports_info = self::get_allowed_reports();

		$reports = $this->load_reports( $reports_info );

		$raw_reports = $this->load_reports( $reports_info, 'raw' );

		?>
		<div id="elementor-system-info">
			<h3><?php echo __( 'System Info', 'elementor' ); ?></h3>
			<div><?php $this->print_report( $reports, 'html' ); ?></div>
			<h3><?php echo __( 'Copy & Paste Info', 'elementor' ); ?></h3>
			<div id="elementor-system-info-raw">
				<label id="elementor-system-info-raw-code-label" for="elementor-system-info-raw-code"><?php echo __( 'You can copy the below info as simple text with Ctrl+C / Ctrl+V:', 'elementor' ); ?></label>
				<textarea id="elementor-system-info-raw-code" readonly>
					<?php

					unset( $raw_reports['wordpress']['report']['admin_email'] );

					$this->print_report( $raw_reports, 'raw' );
					?>
				</textarea>
				<script>
					var textarea = document.getElementById( 'elementor-system-info-raw-code' );
					var selectRange = function() {
						textarea.setSelectionRange( 0, textarea.value.length );
					};
					textarea.onfocus = textarea.onblur = textarea.onclick = selectRange;
					textarea.onfocus();
				</script>
			</div>
			<hr>
			<form action="<?php echo admin_url( 'admin-ajax.php' ); ?>" method="post">
				<input type="hidden" name="action" value="elementor_system_info_download_file">
				<input type="submit" class="button button-primary" value="<?php echo __( 'Download System Info', 'elementor' ); ?>">
			</form>
		</div>
		<?php
	}

	/**
	 * Download file.
	 *
	 * Download the reports files.
	 *
	 * Fired by `wp_ajax_elementor_system_info_download_file` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function download_file() {
		if ( ! current_user_can( $this->capability ) ) {
			wp_die( __( 'You don\'t have permissions to download this file', 'elementor' ) );
		}

		$reports_info = self::get_allowed_reports();
		$reports = $this->load_reports( $reports_info );

		$domain = parse_url( site_url(), PHP_URL_HOST );

		header( 'Content-Type: text/plain' );
		header( 'Content-Disposition:attachment; filename=system-info-' . $domain . '-' . date( 'd-m-Y' ) . '.txt' );

		$this->print_report( $reports );

		die;
	}

	/**
	 * Get report class.
	 *
	 * Retrieve the class of the report for any given report type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $reporter_type The type of the report.
	 *
	 * @return string The class of the report.
	 */
	public function get_reporter_class( $reporter_type ) {
		return $this->get_settings( 'namespaces.classes_namespace' ) . '\\' . ucfirst( $reporter_type ) . '_Reporter';
	}

	/**
	 * Load reports.
	 *
	 * Retrieve the system info reports.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $reports An array of system info reports.
	 * @param string $format - possible values: 'raw' or empty string, meaning 'html'
	 *
	 * @return array An array of system info reports.
	 */
	public function load_reports( $reports, $format = '' ) {
		$result = [];

		$settings = $this->get_settings();

		foreach ( $reports as $report_name => $report_info ) {
			if ( ! empty( $report_info['file_name'] ) ) {
				$file_name = $report_info['file_name'];
			} else {
				$file_name = $settings['dirs']['classes'] . $settings['reportFilePrefix'] . str_replace( '_', '-', $report_name ) . '.php';
			}

			require_once $file_name;

			$reporter_params = [
				'name' => $report_name,
			];

			$reporter_params = array_merge( $reporter_params, $report_info );

			$reporter = $this->create_reporter( $reporter_params );

			if ( ! $reporter instanceof Base_Reporter ) {
				continue;
			}

			$result[ $report_name ] = [
				'report' => $reporter->get_report( $format ),
				'label' => $reporter->get_title(),
			];

			if ( ! empty( $report_info['sub'] ) ) {
				$result[ $report_name ]['sub'] = $this->load_reports( $report_info['sub'] );
			}
		}

		return $result;
	}

	/**
	 * Print report.
	 *
	 * Output the system info page reports using an output template.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array  $reports  An array of system info reports.
	 * @param string $template Output type from the templates folder. Available
	 *                         templates are `raw` and `html`. Default is `raw`.
	 */
	public function print_report( $reports, $template = 'raw' ) {
		static $tabs_count = 0;

		static $required_plugins_properties = [
			'Name',
			'Version',
			'URL',
			'Author',
		];

		$template_path = $this->get_settings( 'dirs.templates' ) . $template . '.php';

		require $template_path;
	}

	/**
	 * Register admin menu.
	 *
	 * Add new Elementor system info admin menu.
	 *
	 * Fired by `admin_menu` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function register_menu() {
		$system_info_text = __( 'System Info', 'elementor' );

		add_submenu_page(
			'elementor',
			$system_info_text,
			$system_info_text,
			$this->capability,
			'elementor-system-info',
			[ $this, 'display_page' ]
		);
	}

	/**
	 * Get default settings.
	 *
	 * Retrieve the default settings. Used to reset the report settings on
	 * initialization.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Default settings.
	 */
	protected function get_default_settings() {
		$settings = [];

		$reporter_properties = Base_Reporter::get_properties_keys();

		array_push( $reporter_properties, 'category', 'name', 'class_name' );

		$settings['reporter_properties'] = $reporter_properties;

		$base_lib_dir = ELEMENTOR_PATH . 'includes/settings/system-info/';

		$settings['dirs'] = [
			'lib'       => $base_lib_dir,
			'templates' => $base_lib_dir . 'templates/',
			'classes'   => $base_lib_dir . 'classes/',
			'helpers'   => $base_lib_dir . 'helpers/',
		];

		$settings['namespaces'] = [
			'namespace' => __NAMESPACE__,
			'classes_namespace' => __NAMESPACE__ . '\Classes',
		];

		$settings['reportFilePrefix'] = '';

		return $settings;
	}

	/**
	 * Init settings.
	 *
	 * Initialize Elementor system info page by setting default settings.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function init_settings() {
		$this->settings = $this->get_default_settings();
	}

	/**
	 * Get settings.
	 *
	 * Retrieve the settings from any given container.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $setting   Optional. Settings required for Elementor system
	 *                         info page. Default is null.
	 * @param array $container Optional. Container. Default is null.
	 *
	 * @return mixed
	 */
	final public function get_settings( $setting = null, array $container = null ) {
		if ( ! $container ) {
			$container = $this->settings;
		}

		if ( $setting ) {
			$setting_thread = explode( '.', $setting );
			$parent_thread = array_shift( $setting_thread );

			if ( $setting_thread ) {
				return $this->get_settings( implode( '.', $setting_thread ), $container[ $parent_thread ] );
			}

			return $container[ $parent_thread ];
		}
		return $container;
	}

	/**
	 * Get allowed reports.
	 *
	 * Retrieve the available reports in Elementor system info page.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array Available reports in Elementor system info page.
	 */
	public static function get_allowed_reports() {
		return self::$reports;
	}

	/**
	 * Add report.
	 *
	 * Register a new report to Elementor system info page.
	 *
	 * @since 1.4.0
	 * @access public
	 * @static
	 *
	 * @param string $report_name The name of the report.
	 * @param array  $report_info Report info.
	 */
	public static function add_report( $report_name, $report_info ) {
		self::$reports[ $report_name ] = $report_info;
	}
}
