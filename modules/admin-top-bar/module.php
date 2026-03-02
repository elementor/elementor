<?php
namespace Elementor\Modules\AdminTopBar;

use Elementor\Core\Admin\Admin;
use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\Base\Base_Object;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin Top Bar Module
 *
 * @deprecated 3.34.2 Use Elementor One package instead
 */
class Module extends BaseApp {

	private $current_screen;

	private $deprecation_notice = 'The admin-top-bar module has been replaced by the Elementor One package.';

	/**
	 * @return bool
	 */
	public static function is_active() {
		return is_admin();
	}

	/**
	 * @return string
	 */
	public function get_name() {
		return 'admin-top-bar';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'current_screen', [ $this, 'fire_deprecated_hooks' ] );
	}

	public function fire_deprecated_hooks() {
		$this->current_screen = get_current_screen();

		if ( ! Admin::is_elementor_admin_page( $this->current_screen ) ) {
			return;
		}

		$this->fire_init_hook();

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->apply_deprecated_filter( 'elementor/admin-top-bar/is-active', [ true, $this->current_screen ], '3.34.2', $this->deprecation_notice );

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->do_deprecated_action( 'elementor/admin_top_bar/before_enqueue_scripts', [ $this ], '3.34.2', $this->deprecation_notice );
	}

	private function fire_init_hook() {
		$deprecated_stub = new class() extends Base_Object {
			protected function get_init_settings() {
				return [
					'is_user_connected' => false,
					'connect_url' => '',
				];
			}
		};

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->do_deprecated_action( 'elementor/admin-top-bar/init', [ $deprecated_stub ], '3.34.2', $this->deprecation_notice );
	}
}
