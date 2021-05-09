<?php
namespace Elementor\Modules\AdminTopBar;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\Experiments\Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {
	private $elementor_pages = [];

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
			'title' => __( 'Admin Top Bar', 'elementor-pro' ),
			'description' => __( 'Adds a top bar to elementors pages in admin area.', 'elementor-pro' ),
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

	private function render_admin_top_bar() {
		?>
			<div id="e-admin-top-bar">
				<div id="elementor-admin-top-bar"></div>
			</div>
		<?php
	}

	/**
	 * Enqueue admin scripts
	 */
	private function enqueue_scripts() {
		wp_enqueue_style(
			'elementor-app-base',
			$this->get_css_assets_url( 'modules/admin-top-bar/admin', null, 'default', true ),
			[],
			ELEMENTOR_VERSION
		);


		// form-submission-admin
		wp_enqueue_script(
			'admin-top-bar',
			$this->get_js_assets_url( 'admin-top-bar' ),   // create path in directory tree
			[
				'react',     //dependencies
				'react-dom',
			],
			ELEMENTOR_VERSION,
			true
		);

		//wp_set_script_translations(
		//	'form-submission-admin',
		//	'elementor-pro',
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
// make it experiment
// make it work only if it is an admin page (done automatically with "is_admin_header" action
// create a react app and basic components
// style the top bar
// make the finder work
// make the "my elementor" work

//--------TODOs-------
// button hover and tooltip
// title
// make it work only when it is elementor page too ("is_elementor_page")
// make it load in dashboared with an option to hide it from dashboared
// make sure that scripts and styles load just when needed
// support RTL (use elementor helpers)

