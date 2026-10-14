<?php
namespace Elementor\Modules\ProInstall;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Pro_Install_Menu_Item implements Admin_Menu_Item_With_Page {

	private Connect_Page_Renderer $renderer;

	public function __construct( Connect $connect, array $script_config ) {
		$page_url = admin_url( 'admin.php?page=elementor-connect-account' );
		$this->renderer = new Connect_Page_Renderer( $connect, $page_url, $script_config );
	}

	public function get_label(): string {
		return esc_html__( 'Connect Account', 'elementor' );
	}

	public function get_page_title(): string {
		return esc_html__( 'Connect Settings', 'elementor' );
	}

	public function get_capability(): string {
		return 'manage_options';
	}

	public function get_parent_slug(): string {
		return Settings::PAGE_ID;
	}

	public function is_visible(): bool {
		return true;
	}

	public function render() {
		$this->renderer->render();
	}
}
