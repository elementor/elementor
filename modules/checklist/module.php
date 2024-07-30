<?php
namespace Elementor\Modules\Checklist;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Settings;
use Elementor\Plugin;
use Elementor\Utils;

if( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {

	const NAME = 'elementor-launchpad-checklist';

	public static function is_active() {
		return is_admin();
	}

	public function get_name() {
		return self::NAME;
	}

	private function render_checklist() {
		?>
		<div id="e-checklist">
		</div>
		<?php
	}
	public function enqueue_checklist_scripts(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			self::NAME,
			$this->get_js_assets_url( 'checklist' ),
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
				'elementor-v2-icons',
			],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( 'e_launchpad_checklist' );
	}

	private function register_checklist_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => 'e_launchpad_checklist',
			'title' => esc_html__( 'Launchpad Checklist', 'elementor' ),
			'description' => esc_html__( 'Launchpad Checklist feature to boost productivity and deliver your site faster', 'elementor' ),
			'hidden' => true,
			'release_status' => 'alpha',
			'default' => Experiments_Manager::STATE_ACTIVE,
		] );
	}

	public function __construct() {
		parent::__construct();

		$this->register_checklist_experiment();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

//		add_action( 'elementor/admin/menu/after_register', function( Admin_Menu_Manager $admin_menu, array $hooks ) {
//			$hook_suffix = 'toplevel_page_elementor';
//			add_action( "admin_print_scripts-{$hook_suffix}", [ $this, 'enqueue_checklist_scripts' ] );
//		}, 10, 2 );

		$this->enqueue_checklist_scripts();

		add_action( 'current_screen', function () {
			$this->render_checklist();
		} );
	}
}
