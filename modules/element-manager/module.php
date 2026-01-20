<?php
namespace Elementor\Modules\ElementManager;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\ElementManager\AdminMenuItems\Editor_One_Elements_Manager_Menu;
use Elementor\Widget_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const PAGE_ID = 'elementor-element-manager';

	public function get_name() {
		return 'element-manager';
	}

	public function __construct() {
		parent::__construct();

		$ajax = new Ajax();
		$ajax->register_endpoints();

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			if ( ! $this->is_editor_one_active() ) {
				$admin_menu->register( static::PAGE_ID, new Admin_Menu_App() );
			}
		}, 25 );

		add_action( 'elementor/editor-one/menu/register', function ( Menu_Data_Provider $menu_data_provider ) {
			$this->register_editor_one_menu( $menu_data_provider );
		} );

		add_action( 'elementor/editor-one/menu/after_register_hidden_submenus', function ( array $hooks ) {
			$this->enqueue_assets_for_editor_one_menu( $hooks );
		} );

		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			$this->enqueue_assets_for_editor_one_menu( $hooks );
		}, 10, 2 );

		add_filter( 'elementor/widgets/is_widget_enabled', function( $should_register, Widget_Base $widget_instance ) {
			return ! Options::is_element_disabled( $widget_instance->get_name() );
		}, 10, 2 );

		add_filter( 'elementor/system-info/usage/settings', function( $usage ) {
			$disabled_elements = Options::get_disabled_elements();

			if ( ! empty( $disabled_elements ) ) {
				$usage['disabled_elements'] = implode( ', ', $disabled_elements );
			}

			return $usage;
		} );

		add_filter( 'elementor/tracker/send_tracking_data_params', function( $params ) {
			$disabled_elements = Options::get_disabled_elements();

			if ( ! empty( $disabled_elements ) ) {
				$params['usages']['disabled_elements'] = $disabled_elements;
			}

			return $params;
		} );
	}

	public function enqueue_assets_for_editor_one_menu( array $hooks ): void {
		if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
			add_action( "admin_print_scripts-{$hooks[ static::PAGE_ID ]}", [ $this, 'enqueue_assets' ] );
			add_action( "admin_footer-{$hooks[ static::PAGE_ID ]}", [ $this, 'print_styles' ], 1000 );
		}
	}

	private function register_editor_one_menu( Menu_Data_Provider $menu_data_provider ): void {
		$menu_data_provider->register_menu( new Editor_One_Elements_Manager_Menu() );
	}

	private function is_editor_one_active(): bool {
		return (bool) Plugin::instance()->modules_manager->get_modules( 'editor-one' );
	}

	public function enqueue_assets() {
		wp_enqueue_script(
			'e-element-manager-app',
			$this->get_js_assets_url( 'element-manager-admin' ),
			[
				'wp-element',
				'wp-components',
				'wp-dom-ready',
				'wp-i18n',
				'elementor-v2-ui',
				'elementor-v2-icons',
			],
			ELEMENTOR_VERSION
		);

		wp_localize_script( 'e-element-manager-app', 'eElementManagerConfig', [
			'nonce' => wp_create_nonce( 'e-element-manager-app' ),
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
		] );

		wp_set_script_translations( 'e-element-manager-app', 'elementor' );

		wp_enqueue_style( 'wp-components' );
		wp_enqueue_style( 'wp-format-library' );
	}

	public function print_styles() {
		?>
		<style>
			.components-button.is-secondary:disabled {
				box-shadow: inset 0 0 0 1px #949494;
			}
		</style>
		<?php
	}
}
