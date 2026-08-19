<?php

namespace Elementor\Modules\BuilderMcp;

use Elementor\MCP\Composer\Admin\Page;
use ElementorPro\Base\Module_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Module_Base {

	public function get_name() {
		return 'builder-mcp';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'admin_menu', [ $this, 'register_admin_page' ] );
	}

	public function register_admin_page(): void {
		if ( ! class_exists( Page::class ) ) {
			return;
		}

		$page = Page::instance( ELEMENTOR_URL );

		add_menu_page(
			$page->get_page_title(),
			$page->get_label(),
			$page->get_capability(),
			$page->get_slug(),
			[ $page, 'render' ],
			$page->get_icon(),
			3
		);
	}
}
