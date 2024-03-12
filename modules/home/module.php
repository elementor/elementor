<?php
namespace Elementor\Modules\Home;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {

	const PAGE_ID = 'home_screen';

	public function get_name(): string {
		return 'home';
	}

	public function __construct() {
		parent::__construct();

		$this->register_layout_experiment();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			$hook_suffix = 'toplevel_page_elementor';
			add_action( "admin_print_scripts-{$hook_suffix}", [ $this, 'enqueue_home_screen_scripts' ] );
		}, 10, 2 );
	}

	public function enqueue_home_screen_scripts(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			'e-home-screen',
			ELEMENTOR_ASSETS_URL . 'js/e-home-screen' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( 'e-home-screen', 'elementor' );

		wp_localize_script(
			'e-home-screen',
			'elementorHomeScreenData',
			$this->get_app_js_config()
		);
	}

	public function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::PAGE_ID );
	}

	private function register_layout_experiment(): void {
		Plugin::$instance->experiments->add_feature( [
			'name' => static::PAGE_ID,
			'title' => esc_html__( 'Elementor Home Screen', 'elementor' ),
			'description' => esc_html__( 'Default Elementor menu page.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
		] );
	}

	private function get_app_js_config(): array {
		return [
			'data' => API::get_home_screen_items( true ),
			'createNewPageUrl' => Plugin::$instance->documents->get_create_new_post_url( 'page' ),
		];
	}
}
