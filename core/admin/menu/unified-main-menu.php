<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Items\Editor_Menu_Item;
use Elementor\Core\Admin\Menu\Items\Settings_Group_Menu_Item;
use Elementor\Core\Admin\Menu\Items\Templates_Group_Menu_Item;
use Elementor\Core\Base\Base_Object;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Unified_Main_Menu extends Base_Object {

	const MENU_SLUG = 'elementor';

	const POSITION = 58.5;

	private $args;

	private $options;

	private $submenus = [];

	public function __construct() {
		$this->init_args();
		$this->init_options();

		add_action( 'admin_menu', function () {
			$this->register();
		} );

		if ( $this->options['separator'] ) {
			add_action( 'admin_menu', function () {
				$this->add_menu_separator();
			} );

			add_filter( 'custom_menu_order', '__return_true' );

			add_filter( 'menu_order', function ( $menu_order ) {
				return $this->rearrange_menu_separator( $menu_order );
			} );
		}
	}

	public function get_args( $arg = null ) {
		return self::get_items( $this->args, $arg );
	}

	public function add_submenu( $submenu_args ) {
		$default_submenu_args = [
			'page_title' => '',
			'capability' => $this->args['capability'],
			'function' => null,
			'index' => null,
		];

		$this->submenus[] = array_merge( $default_submenu_args, $submenu_args );
	}

	protected function get_init_args() {
		return [
			'page_title' => esc_html__( 'Elementor', 'elementor' ),
			'menu_title' => esc_html__( 'Elementor', 'elementor' ),
			'capability' => 'manage_options',
			'menu_slug' => self::MENU_SLUG,
			'function' => [ Plugin::$instance->settings, 'display_settings_page' ],
			'icon_url' => null,
			'position' => self::POSITION,
		];
	}

	protected function get_init_options() {
		return [
			'separator' => true,
		];
	}

	protected function register_default_submenus() {
		$this->add_submenu( [
			'page_title' => esc_html__( 'Templates', 'elementor' ),
			'menu_title' => esc_html__( 'Templates', 'elementor' ),
			'menu_slug' => Templates_Group_Menu_Item::PAGE_ID,
			'function' => [ $this, 'render_templates_page' ],
			'index' => 10,
		] );

		$this->add_submenu( [
			'page_title' => esc_html__( 'Settings', 'elementor' ),
			'menu_title' => esc_html__( 'Settings', 'elementor' ),
			'menu_slug' => Settings_Group_Menu_Item::PAGE_ID,
			'function' => [ Plugin::$instance->settings, 'display_settings_page' ],
			'index' => 20,
		] );

		$this->add_submenu( [
			'menu_title' => esc_html__( 'Help', 'elementor' ),
			'menu_slug' => 'go_knowledge_base_site',
			'function' => [ Plugin::$instance->settings, 'handle_external_redirects' ],
			'index' => 150,
		] );
	}

	public function render_templates_page() {
		wp_safe_redirect( admin_url( Source_Local::ADMIN_MENU_SLUG ) );
		exit;
	}

	protected function register() {
		$args = $this->args;

		add_menu_page(
			$args['page_title'],
			$args['menu_title'],
			$args['capability'],
			$args['menu_slug'],
			$args['function'],
			$args['icon_url'],
			$args['position']
		);

		$this->register_default_submenus();

		do_action( 'elementor/admin/menu_registered/' . $args['menu_slug'], $this );

		usort( $this->submenus, function ( $a, $b ) {
			$a_index = $a['index'] ?? 999;
			$b_index = $b['index'] ?? 999;
			return $a_index - $b_index;
		} );

		foreach ( $this->submenus as $index => $submenu_item ) {
			$submenu_args = [
				$args['menu_slug'],
				$submenu_item['page_title'],
				$submenu_item['menu_title'],
				$submenu_item['capability'],
				$submenu_item['menu_slug'],
				$submenu_item['function'],
			];

			if ( 0 === $submenu_item['index'] ) {
				$submenu_args[] = 0;
			}

			add_submenu_page( ...$submenu_args );

			if ( ! empty( $submenu_item['class'] ) ) {
				global $submenu;
				$submenu[ $args['menu_slug'] ][ $index + 1 ][4] = $submenu_item['class'];
			}
		}

		$this->rearrange_elementor_submenu();
	}

	private function rearrange_elementor_submenu() {
		global $submenu;

		$elementor_menu_slug = $this->get_args( 'menu_slug' );

		if ( empty( $submenu[ $elementor_menu_slug ] ) ) {
			return;
		}

		$elementor_submenu_old_index = null;
		$settings_submenu_index = null;

		foreach ( $submenu[ $elementor_menu_slug ] as $index => $submenu_item ) {
			if ( $elementor_menu_slug === $submenu_item[2] ) {
				$elementor_submenu_old_index = $index;
			} elseif ( Settings_Group_Menu_Item::PAGE_ID === $submenu_item[2] ) {
				$settings_submenu_index = $index;
			}
		}

		if ( null !== $elementor_submenu_old_index && null !== $settings_submenu_index ) {
			unset( $submenu[ $elementor_menu_slug ][ $elementor_submenu_old_index ] );
			$submenu[ $elementor_menu_slug ] = array_values( $submenu[ $elementor_menu_slug ] );
		}
	}

	private function init_args() {
		$default_args = [
			'function' => null,
			'icon_url' => null,
			'position' => null,
		];

		$this->args = array_merge( $default_args, $this->get_init_args() );
	}

	private function init_options() {
		$default_options = [
			'separator' => false,
		];

		$this->options = array_merge( $default_options, $this->get_init_options() );
	}

	private function add_menu_separator() {
		global $menu;

		$slug = $this->args['menu_slug'];

		$menu[] = [ '', 'read', 'separator-' . $slug, '', 'wp-menu-separator ' . $slug ];
	}

	private function rearrange_menu_separator( $menu_order ) {
		$elementor_separator = array_search( 'separator-' . $this->args['menu_slug'], $menu_order, true );

		if ( false === $elementor_separator ) {
			return $menu_order;
		}

		$elementor_menu = array_search( $this->args['menu_slug'], $menu_order, true );

		if ( false === $elementor_menu ) {
			return $menu_order;
		}

		unset( $menu_order[ $elementor_separator ] );

		$new_menu_order = [];

		foreach ( $menu_order as $item ) {
			if ( $this->args['menu_slug'] === $item ) {
				$new_menu_order[] = 'separator-' . $this->args['menu_slug'];
			}
			$new_menu_order[] = $item;
		}

		return $new_menu_order;
	}
}

