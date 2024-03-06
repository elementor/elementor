<?php
namespace Elementor\Modules\Home;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\App as BaseApp;;
use Elementor\Utils;
use Elementor\Modules\Apps\Admin_Pointer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {

	const PAGE_ID = 'elementor-home';

	public function get_name() {
		return 'home';
	}

	public function __construct() {
		parent::__construct();

		Admin_Pointer::add_hooks();

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$admin_menu->register( static::PAGE_ID, new Home_Menu_item() );
		}, 116 );

		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
				add_action( "admin_print_scripts-{$hooks[ static::PAGE_ID ]}", [ $this, 'enqueue_main_script' ] );
			}
		}, 10, 2 );
	}

	public function enqueue_main_script() {
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
	}
}
