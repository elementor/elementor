<?php
namespace Elementor\Modules\NewPostDialog;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Modules\AdminTopBar\Module as AdminTopBar;
use Elementor\Plugin;

use Elementor\Modules\NewPostDialog\PostTypes\Page;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor system info module.
 *
 * Elementor system info module handler class is responsible for registering and
 * managing Elementor system info reports.
 *
 * @since 2.9.0
 */
class Module extends BaseApp {

	public static function is_active() {
		return is_admin();
	}

	/**
	 * Get module name.
	 *
	 * Retrieve the system info module name.
	 *
	 * @since 2.9.0
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'new-post-dialog';
	}

	/**
	 * Required user capabilities.
	 *
	 * Holds the user capabilities required to manage Elementor menus.
	 *
	 * @since 2.9.0
	 * @access private
	 *
	 * @var string
	 */
	private $capability = 'edit_posts';

	public function get_capability() {
		return $this->capability;
	}

	private $post_types = [];

	/**
	 * Main system info page constructor.
	 *
	 * Initializing Elementor system info page.
	 *
	 * @since 2.9.0
	 * @access public
	 */
	public function __construct() {
		parent::__construct();

		$this->register_post_types();
		$this->add_actions();
	}

	private function register_post_types() {
		$this->register_post_type( new Page() );
	}

	private function register_post_type( $type ) {
		$this->post_types[ $type->get_post_type() ] = $type;
	}

	private function add_actions() {
		add_action( 'admin_url',						[ $this, 'update_admin_url' ], 10, 2 );
		add_action( 'elementor/admin/menu/register',	[ $this, 'update_admin_menu_item' ] );
		add_action( 'admin_bar_menu', 					[ $this, 'update_admin_top_bar_item' ], 500 );
		add_action( 'admin_init',						[ $this, 'redirect_updated_links' ] );

		add_action( 'admin_enqueue_scripts', 			[ $this, 'enqueue_scripts' ] );
		add_action( 'admin_footer', 					[ $this, 'print_dialog_forms' ] );
		add_action( 'elementor/ajax/register_actions',	[ $this, 'register_ajax_actions' ] );
	}

	public function update_admin_url( $url, $path ) {
		foreach ( $this->post_types as $type => $details ) {
			if ( $details->do_override_every_link() ) {
				continue;
			}

			if ( "post-new.php?post_type=$type" === $path ) {
				$path = "post-new.php?post_type={$type}_e_dialog";
			}
		}

		return $path;
	}
	/**
	 * Update the "Add New" menu item
	 *
	 * @param Admin_Menu_Manager $admin_menu
	 */
	public function update_admin_menu_item( Admin_Menu_Manager $admin_menu ) {
		foreach ( $this->post_types as $type => $details ) {
			if ( $details->do_override_every_link() ) {
				continue;
			}

			$admin_menu->update_submenu_items( "edit.php?post_type=$type", [
				"post-new.php?post_type=$type" => "post-new.php?post_type={$type}_e_dialog",
			] );
		}
	}

	/**
	 * Update the "New Page" admin top bar item
	 *
	 * @param \WP_Admin_Bar $admin_bar
	 */
	public function update_admin_top_bar_item( \WP_Admin_Bar $admin_bar ) {
		foreach ( $this->post_types as $type => $details ) {
			if ( $details->do_override_every_link() ) {
				continue;
			}

			AdminTopBar::update_items( $admin_bar, [
				"new-$type" => [
					'href' => "post-new.php?post_type={$type}_e_dialog",
				],
			] );
		}
	}

	public function redirect_updated_links() {
		global $pagenow;

		if ( 'post-new.php' !== $pagenow || empty( $_GET['post_type'] ) ) {
			return;
		}

		$post_type = str_replace( '_e_dialog', '', $_GET['post_type'] );
		if ( ! in_array( $post_type, array_keys( $this->post_types ) ) || ! $this->post_types[ $post_type ]->do_override_every_link() ) {
			return;
		}

		wp_redirect( admin_url( "/post-new.php?post_type=$post_type" ) );
		exit;
	}

	/**
	 * Add the new page name input form to the page
	 */
	public function print_dialog_forms() {
		foreach ( $this->post_types as $type => $details ) {
			?>
			<form class="e-new-post-dialog-form" id="e_new_post_dialog_form_<?= $type ?>" method="post">
				<input type="hidden" name="post_type" value="<?= $type ?>" />
				<div class="e-new-post-dialog__title"><?= $details->get_dialog_title(); ?></div>
				<div class="e-new-post-dialog__content">
					<?php $details->print_dialog_form(); ?>
				</div>
			</form>
			<?php
		}
	}

	/**
	 * Add actions.
	 *
	 * Register filters and actions for the main system info page.
	 *
	 * @since 2.9.0
	 * @access private
	 */
	public function enqueue_scripts() {
		wp_enqueue_style( 'elementor-new-post-dialog', $this->get_css_assets_url( 'modules/new-post-dialog/new-post-dialog', null, 'default', true ), [], ELEMENTOR_VERSION );

		wp_enqueue_script( 'elementor-new-post-dialog', $this->get_js_assets_url( 'new-post-dialog' ), [
			'elementor-common',
			'react',
			'react-dom',
		], ELEMENTOR_VERSION, true );

		Utils::print_js_config( 'elementor-new-post-dialog', 'elementorNewPostDialogsConfig', $this->get_config() );
	}

	private function get_config(): array {
		foreach ( array_keys( $this->post_types ) as $type ) {
			$config['types'][ $type ] = [
				'errorMessage' => esc_html__( "Error creating $type", 'elementor' ),
			];
		}
//		$config['types'] = array_keys( $this->post_types );

		return $config;
	}

	public function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'elementor_new_post_dialog_submit', [ $this, 'create_post' ] );
	}

	/**
	 * @param array{ post_id: int, post_title: string, default_post_title: string } $data
	 *
	 * @return string
	 */
	public function create_post( array $data ): string {
		$document = Plugin::$instance->documents->create( 'post', [
			'post_type' => $data['post_type'],
		] );

		if ( is_wp_error( $document ) ) {
			wp_die( $document ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}

		if ( empty( $data['post_title'] ) ) {
			$data['post_title'] = str_replace( '{number}', '#' . $document->get_id(), $this->post_types[ $data['post_type'] ]->get_default_title() );
		}

		$document->save( [
			'settings' => [
				'post_title' => $data['post_title']
			]
		] );
		$document->set_is_built_with_elementor( true );

		return $document->get_edit_url();
	}
}
