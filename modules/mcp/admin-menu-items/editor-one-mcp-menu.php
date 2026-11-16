<?php

namespace Elementor\Modules\Mcp\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\MCP\Composer\Admin\Page;
use Elementor\Modules\EditorOne\Classes\Admin_Page_Title;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\Mcp\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Mcp_Menu implements Menu_Item_Third_Level_Interface, Admin_Menu_Item_With_Page {

	const REGISTER_PRIORITY_AFTER_SUBMISSIONS = 11;

	private Page $page;

	public function __construct() {
		$this->page = Page::instance();
	}

	public function get_capability(): string {
		return $this->page->get_capability();
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_HOME_MENU_SLUG;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_group_id(): string {
		return Menu_Config::EDITOR_GROUP_ID;
	}

	public function get_label(): string {
		return $this->page->get_label();
	}

	public function get_position(): int {
		return 25;
	}

	public function get_slug(): string {
		return $this->page->get_slug();
	}

	public function get_icon(): string {
		return 'extension';
	}

	public function has_children(): bool {
		return false;
	}

	public function get_page_title() {
		return $this->page->get_page_title();
	}

	public function render() {
		ob_start();
		Module::instance()->enqueue_analytics_registrar();
		$this->page->render();
		Module::instance()->enqueue_promotion_registrar();
		$html = ob_get_clean();

		if ( ! is_string( $html ) || '' === $html ) {
			return;
		}

		$title_markup = Admin_Page_Title::get_markup( (string) $this->get_page_title() );
		$html = preg_replace( '/(<div class="wrap">\s*)/', '$1' . $title_markup, $html, 1 );

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Injected markup is escaped; MCP page HTML is trusted plugin output.
		echo $html;
	}
}
