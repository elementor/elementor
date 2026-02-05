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
 * @deprecated 3.34.2 Use Elementor One package instead
 */
class Module extends BaseModule {

	private $current_screen;

	private const DEPRECATION_MESSAGE = 'The admin-top-bar module has been replaced by the Elementor One package.';

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
		_deprecated_function( __CLASS__, '3.34.2', 'Elementor One package' );

		parent::__construct();

		add_action( 'current_screen', [ $this, 'fire_deprecated_hooks' ] );
	}

	public function fire_deprecated_hooks() {
		$this->current_screen = get_current_screen();

		if ( ! Admin::is_elementor_admin_page( $this->current_screen ) ) {
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
			self::DEPRECATION_MESSAGE
		);
	}

	private function fire_is_active_filter() {
		if ( ! has_filter( 'elementor/admin-top-bar/is-active' ) ) {
			return;
		}

		apply_filters_deprecated(
			'elementor/admin-top-bar/is-active',
			[ true, $this->current_screen ],
			'3.34.2',
			'',
			self::DEPRECATION_MESSAGE
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
			self::DEPRECATION_MESSAGE
		);
	}
}

