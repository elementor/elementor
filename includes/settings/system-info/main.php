<?php
namespace Elementor\System_Info;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;
use Elementor\System_Info\Helpers\Model_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Main {

	private $capability = 'manage_options';

	/**
	 * @var array
	 */
	private $settings = [];

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
	 * @since 1.0.0
	 * @access public
	*/
	public function __construct() {
		$this->require_files();
		$this->init_settings();
		$this->add_actions();
	}

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function require_files() {
		require __DIR__ . '/classes/abstracts/base-reporter.php';
		require __DIR__ . '/helpers/model-helper.php';
	}

	/**
	 * @since 1.0.0
	 * @access public
	 * @param array $properties
	 *
	 * @return \WP_Error|false|Base_Reporter
	 */
	public function create_reporter( array $properties ) {
		$properties = Model_Helper::prepare_properties( $this->get_settings( 'reporter_properties' ), $properties );

		$reporter_class = $properties['class_name'] ? $properties['class_name'] : $this->get_reporter_class( $properties['name'] );

		$reporter = new $reporter_class( $properties );

		if ( ! ( $reporter instanceof Base_Reporter ) ) {
			return new \WP_Error( 'Each reporter must to be an instance or sub-instance of Base_Reporter class' );
		}

		if ( ! $reporter->is_enabled() ) {
			return false;
		}

		return $reporter;
	}

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function add_actions() {
		add_action( 'admin_menu', [ $this, 'register_menu' ], 501 );

		add_action( 'wp_ajax_elementor_system_info_download_file', [ $this, 'download_file' ] );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function display_page() {
		$reports_info = self::get_allowed_reports();

		$reports = $this->load_reports( $reports_info );

		?>
		<div id="elementor-system-info">
			<h3><?php _e( 'System Info', 'elementor' ); ?></h3>
			<div><?php $this->print_report( $reports, 'html' ); ?></div>
			<h3><?php _e( 'Copy & Paste Info', 'elementor' ); ?></h3>
			<div id="elementor-system-info-raw">
				<label id="elementor-system-info-raw-code-label" for="elementor-system-info-raw-code"><?php _e( 'You can copy the below info as simple text with Ctrl+C / Ctrl+V:', 'elementor' ); ?></label>
				<textarea id="elementor-system-info-raw-code" readonly>
					<?php
					unset( $reports['wordpress']['report']['admin_email'] );

					$this->print_report( $reports, 'raw' );
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
				<input type="submit" class="button button-primary" value="<?php _e( 'Download System Info', 'elementor' ); ?>">
			</form>
		</div>
		<?php
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function download_file() {
		if ( ! current_user_can( $this->capability ) ) {
			wp_die( __( 'You don\'t have a permission to download this file', 'elementor' ) );
		}

		$reports_info = self::get_allowed_reports();
		$reports = $this->load_reports( $reports_info );

		header( 'Content-Type: text/plain' );
		header( 'Content-Disposition:attachment; filename=system-info-' . $_SERVER['HTTP_HOST'] . '-' . date( 'd-m-Y' ) . '.txt' );

		$this->print_report( $reports );

		die;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_reporter_class( $reporter_type ) {
		return $this->get_settings( 'namespaces.classes_namespace' ) . '\\' . ucfirst( $reporter_type ) . '_Reporter';
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function load_reports( $reports ) {
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
				'report' => $reporter->get_report(),
				'label' => $reporter->get_title(),
			];

			if ( ! empty( $report_info['sub'] ) ) {
				$result[ $report_name ]['sub'] = $this->load_reports( $report_info['sub'] );
			}
		}

		return $result;
	}

	/**
	 * @since 1.0.0
	 * @access public
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
	 * @since 1.0.0
	 * @access protected
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
	 * @since 1.0.0
	 * @access private
	*/
	private function init_settings() {
		$this->settings = $this->get_default_settings();
	}

	/**
	 * @since 1.0.0
	 * @access public
	 * @param string $setting
	 * @param array  $container
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
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function get_allowed_reports() {
		return self::$reports;
	}

	/**
	 * @static
	 * @since 1.4.0
	 * @access public
	*/
	public static function add_report( $report_name, $report_info ) {
		self::$reports[ $report_name ] = $report_info;
	}
}
