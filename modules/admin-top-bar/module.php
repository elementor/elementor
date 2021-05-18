<?php
namespace Elementor\Modules\AdminTopBar;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\Experiments\Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {
	//private $elementor_pages = [];
	const ELEMENTOR_MENU_ITEM_IDS = [
		'toplevel_page_elementor',
		'menu-posts-elementor_library'

	];
	/**
	 * @return bool
	 */
	public static function is_active() {
		return is_admin() && static::is_elementor_page();
		//return ! _is_elementor_installed();
	}

	public static function get_experimental_data() {
		return [
			'name' => 'admin-top-bar',
			'title' => __( 'Admin Top Bar', 'elementor' ),
			'description' => __( 'Adds a top bar to elementors pages in admin area.', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'default' => Manager::STATE_INACTIVE,
		];
	}

	private static function is_elementor_page() {
		return true;
	}

	/**
	 * @return string
	 */
	public function get_name() {
		return 'admin-top-bar';
	}

	// TODO: Remove div if not neccesary or rename.
	private function render_admin_top_bar() {
		?>
			<div id="e-admin-top-bar">
<!--				<div id="elementor-admin-top-bar"></div>-->
			</div>
		<?php
	}

	protected function get_init_settings() {
		return [
			'elementor_menu_item_ids' => self::ELEMENTOR_MENU_ITEM_IDS,
		];
	}

	/**
	 * Enqueue admin scripts
	 */
	private function enqueue_scripts() {
		wp_enqueue_style(
			'elementor-admin-top-bar',
			$this->get_css_assets_url( 'modules/admin-top-bar/admin', null, 'default', true ),
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'elementor-admin-top-bar',
			$this->get_js_assets_url( 'admin-top-bar' ),   // create path in directory tree
			[
				'react',     //dependencies
				'react-dom',
			],
			ELEMENTOR_VERSION,
			true
		);

		$this->print_config();

		//wp_set_script_translations(
		//	'form-submission-admin',
		//	'elementor',
		//	ELEMENTOR_PRO_PATH . 'languages'
		//);
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		parent::__construct();

		add_action( 'in_admin_header', function() {
			$this->render_admin_top_bar();
		} );

		add_action( 'admin_enqueue_scripts', function () {
			$this->enqueue_scripts();
		} );
	}
}
//--------DONE--------
// make it an experiment
// make it work only if it is an admin page (done automatically with "is_admin_header" action
// create a react app and basic components
// style the top bar
// make the finder work
// make the "my elementor" work
// dynamic title and action buttons

//--------TODOs-------
// button hover and tooltip
// make it work only when it is elementor page too ("is_elementor_page")
// make it load in dashboard with an option to hide it from dashboard
// make sure that scripts and styles load just when needed
// support RTL (use elementor helpers)

//--------Issues-------
// Submission area - it is a react app and the title which I have to get is not rendered yet when I try to query it.
// Import templates button - one of the buttons that I move to the  top bar is to open a dialog. The way it works is that the dialog is part of the DOM (not in absolute/fixed position) so I need guidelines on how to approach it.
// Since the admin top bar is in absolute position and it needs to push down the admin page content not in a native way, when there are a lot of items in the top bar (for example when the cloud will hook more content inside) it will be hard to handle it.
// Since I query the title and buttons from DOM, there is a moment when the page loads which they appear in the page before moving into the admin top bar.
// Prevent top bar from pushing page content when not displayed
