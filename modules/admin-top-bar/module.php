<?php
namespace Elementor\Modules\AdminTopBar;

use Elementor\Core\Admin\Admin;
use Elementor\Core\Base\Base_Object;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin Top Bar Module
 *
 * @deprecated 3.34.2 Use Editor One module instead
 */
class Module extends BaseModule {

	public function get_name() {
		return 'admin-top-bar';
	}

	public static function is_active() {
		return is_admin();
	}

	public function __construct() {
		_deprecated_function( __CLASS__, '3.34.2', 'Editor One module' );

		parent::__construct();

		add_action( 'current_screen', [ $this, 'fire_deprecated_hooks' ] );
	}

	public function fire_deprecated_hooks() {
		if ( ! Admin::is_elementor_admin_page() ) {
			return;
		}

		$this->fire_init_hook();
		$this->fire_is_active_filter();
		$this->fire_before_enqueue_scripts_hook();
	}

	private function fire_init_hook() {
		if ( ! has_action( 'elementor/admin-top-bar/init' ) ) {
			return;
		}

		$deprecated_stub = new class() extends Base_Object {
			protected function get_init_settings() {
				return [
					'is_user_connected' => false,
					'connect_url' => '',
				];
			}
		};

		do_action_deprecated(
			'elementor/admin-top-bar/init',
			[ $deprecated_stub ],
			'3.34.2',
			'',
			'The admin-top-bar module has been replaced by Editor One.'
		);
	}

	private function fire_is_active_filter() {
		if ( ! has_filter( 'elementor/admin-top-bar/is-active' ) ) {
			return;
		}

		apply_filters_deprecated(
			'elementor/admin-top-bar/is-active',
			[ true, get_current_screen() ],
			'3.34.2',
			'',
			'The admin-top-bar module has been replaced by Editor One.'
		);
	}

	private function fire_before_enqueue_scripts_hook() {
		if ( ! has_action( 'elementor/admin_top_bar/before_enqueue_scripts' ) ) {
			return;
		}

		do_action_deprecated(
			'elementor/admin_top_bar/before_enqueue_scripts',
			[],
			'3.34.2',
			'',
			'The admin-top-bar module has been replaced by Editor One.'
		);
	}
}
