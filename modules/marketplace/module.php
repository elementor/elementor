<?php
namespace Elementor\Modules\Marketplace;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const PAGE_ID = 'elementor-marketplace';

	public function get_name() {
		return 'marketplace';
	}

	public function __construct() {
		parent::__construct();

		Admin_Pointer::add_hooks();

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$admin_menu->register( static::PAGE_ID, new Admin_Menu_Marketplace() );
		}, 115 );

		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
				add_action( "admin_print_scripts-{$hooks[ static::PAGE_ID ]}", [ $this, 'enqueue_assets' ] );
			}
		}, 10, 2 );
	}

	public function enqueue_assets() {
		add_filter( 'admin_body_class', [ $this, 'body_status_classes' ] );

		wp_enqueue_style(
			'elementor-marketplace',
			$this->get_css_assets_url( 'modules/marketplace/admin' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function body_status_classes( $admin_body_classes ) {
		$admin_body_classes .= ' elementor-marketplace-page';

		return $admin_body_classes;
	}
}
