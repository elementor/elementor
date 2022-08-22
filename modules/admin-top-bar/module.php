<?php
namespace Elementor\Modules\AdminTopBar;

use Elementor\Plugin;
use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\Experiments\Manager;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {

	/**
	 * @return bool
	 */
	public static function is_active() {
		return is_admin();
	}

	public static function get_experimental_data() {
		return [
			'name' => 'admin-top-bar',
			'title' => esc_html__( 'Admin Top Bar', 'elementor' ),
			'description' => esc_html__( 'Adds a top bar to elementors pages in admin area.', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_STABLE,
			'new_site' => [
				'default_active' => true,
			],
		];
	}

	/**
	 * @return string
	 */
	public function get_name() {
		return 'admin-top-bar';
	}

	private function render_admin_top_bar() {
		?>
		<div id="e-admin-top-bar-root">
		</div>
		<?php
	}

	/**
	 * Enqueue admin scripts
	 */
	private function enqueue_scripts() {
		wp_enqueue_style( 'elementor-admin-top-bar-fonts', 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', [], ELEMENTOR_VERSION );

		wp_enqueue_style( 'elementor-admin-top-bar', $this->get_css_assets_url( 'admin-top-bar', null, 'default', true ), [], ELEMENTOR_VERSION );

		wp_enqueue_script( 'elementor-admin-top-bar', $this->get_js_assets_url( 'admin-top-bar' ), [
			'elementor-common',
			'react',
			'react-dom',
			'tipsy',
		], ELEMENTOR_VERSION, true );

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script( 'tipsy', ELEMENTOR_ASSETS_URL . 'lib/tipsy/tipsy' . $min_suffix . '.js', [
			'jquery',
		], '1.0.0', true );

		$this->print_config();
	}

	private function add_frontend_settings() {
		$settings = [];
		$settings['is_administrator'] = current_user_can( 'manage_options' );
		$current_screen = get_current_screen();

		/** @var \Elementor\Core\Common\Modules\Connect\Apps\Library $library */
		$library = Plugin::$instance->common->get_component( 'connect' )->get_app( 'library' );
		if ( $library ) {
			$settings = array_merge( $settings, [
				'is_user_connected' => $library->is_connected(),
				'connect_url' => $library->get_admin_url( 'authorize', [
					'utm_source' => 'top-bar',
					'utm_medium' => 'wp-dash',
					'utm_campaign' => 'connect-account',
					'utm_content' => $current_screen->id,
					'source' => 'generic',
				] ),
			] );
		}

		$this->set_settings( $settings );

		do_action( 'elementor/admin-top-bar/init', $this );
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		parent::__construct();

		add_action( 'in_admin_header', function () {
			$this->render_admin_top_bar();
		} );

		add_action( 'admin_enqueue_scripts', function () {
			$this->enqueue_scripts();
		} );

		add_action( 'current_screen', function () {
			$this->add_frontend_settings();
		} );
	}
}
