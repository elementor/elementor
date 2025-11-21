<?php
namespace Elementor\Modules\EditorScreenNavigation;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseApp {

	public static function is_active() {
		return is_admin();
	}

	public function get_name() {
		return 'editor-screen-navigation';
	}

	private function render_navigation_sidebar() {
		?>
		<div id="e-navigation-sidebar-root"></div>
		<?php
	}

	private function enqueue_scripts() {
		wp_enqueue_style(
			'elementor-editor-screen-navigation',
			$this->get_css_assets_url( 'editor-screen-navigation' ),
			[],
			ELEMENTOR_VERSION
		);

	wp_enqueue_script(
		'elementor-editor-screen-navigation',
		$this->get_js_assets_url( 'editor-screen-navigation' ),
		[
			'elementor-common',
			'react',
			'react-dom',
			'elementor-v2-ui',
		],
		ELEMENTOR_VERSION,
		true
	);

		wp_set_script_translations( 'elementor-editor-screen-navigation', 'elementor' );

		$this->print_config();
	}

	public static function get_navigation_config( $current_page_id = '' ) {
		if ( empty( $current_page_id ) ) {
			$current_screen = get_current_screen();
			$current_page_id = $current_screen ? $current_screen->id : '';
		}

		return [
			'currentPage' => $current_page_id,
			'menuItems' => [
				[
					'id' => 'home',
					'label' => __( 'Home', 'elementor' ),
					'url' => admin_url( 'admin.php?page=editor_screen' ),
					'icon' => 'eicon-elementor-circle',
					'page' => 'editor_screen',
				],
				[
					'id' => 'custom_fonts',
					'label' => __( 'Fonts', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor_custom_fonts' ),
					'icon' => 'eicon-font',
					'page' => 'elementor_custom_fonts',
				],
				[
					'id' => 'custom_icons',
					'label' => __( 'Icons', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor_custom_icons' ),
					'icon' => 'eicon-library-upload',
					'page' => 'elementor_custom_icons',
				],
				[
					'id' => 'custom_code',
					'label' => __( 'Code', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor_custom_code' ),
					'icon' => 'eicon-code',
					'page' => 'elementor_custom_code',
				],
				[
					'id' => 'tools',
					'label' => __( 'Tools', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor-tools' ),
					'icon' => 'eicon-tools',
					'page' => 'elementor-tools',
				],
				[
					'id' => 'saved_templates',
					'label' => __( 'Saved Templates', 'elementor' ),
					'url' => admin_url( 'edit.php?post_type=elementor_library' ),
					'icon' => 'eicon-folder',
					'page' => 'elementor_library',
				],
			],
		];
	}

	private function add_frontend_settings() {
		$this->set_settings( self::get_navigation_config() );
	}

	public function hide_templates_menu() {
		remove_menu_page( 'edit.php?post_type=elementor_library' );
	}

	private function is_navigation_sidebar_active() {
		$current_screen = get_current_screen();

		if ( ! $current_screen ) {
			return false;
		}

		if ( 'elementor_page_e-form-submissions' === $current_screen->id || 'toplevel_page_elementor' === $current_screen->id ) {
			return false;
		}

		$is_elementor_page = strpos( $current_screen->id ?? '', 'elementor' ) !== false;
		$is_elementor_post_type_page = strpos( $current_screen->post_type ?? '', 'elementor' ) !== false;

		return apply_filters(
			'elementor/editor-screen-navigation/is-active',
			$is_elementor_page || $is_elementor_post_type_page,
			$current_screen
		);
	}

	public function __construct() {
		parent::__construct();

		add_action( 'current_screen', function () {
			if ( ! $this->is_navigation_sidebar_active() ) {
				return;
			}

			$this->add_frontend_settings();

			add_action( 'in_admin_header', function () {
				$this->render_navigation_sidebar();
			}, 5 );

			add_action( 'admin_enqueue_scripts', function () {
				$this->enqueue_scripts();
			} );
		} );

		add_action( 'admin_menu', [ $this, 'hide_templates_menu' ], 999 );

		add_filter( 'parent_file', [ $this, 'fix_parent_menu' ] );

		add_filter( 'admin_body_class', [ $this, 'add_body_class' ] );
	}

	public function add_body_class( $classes ) {
		if ( $this->is_navigation_sidebar_active() ) {
			$classes .= ' e-one-editor-page';
		}

		return $classes;
	}

	public function fix_parent_menu( $parent_file ) {
		global $current_screen;

		if ( ! $current_screen ) {
			return $parent_file;
		}

		if ( $current_screen->post_type === 'elementor_library' ) {
			return 'elementor';
		}

		return $parent_file;
	}
}
