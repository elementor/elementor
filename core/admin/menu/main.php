<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Items\Settings_Group_Menu_Item;
use Elementor\Core\Admin\Menu\Items\Templates_Group_Menu_Item;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Main extends Base {

	protected function get_init_args() {
		return [
			'page_title' => esc_html__( 'Elementor', 'elementor' ),
			'menu_title' => esc_html__( 'Elementor', 'elementor' ),
			'capability' => 'manage_options',
			'menu_slug' => 'elementor',
			'function' => [ Plugin::$instance->settings, 'display_settings_page' ],
			'position' => 58.5,
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
			'function' => [ $this, 'render_templates_redirect' ],
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

	public function render_templates_redirect() {
		wp_safe_redirect( admin_url( Source_Local::ADMIN_MENU_SLUG ) );
		exit;
	}

	protected function register() {
		parent::register();

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
			} elseif ( Tools::PAGE_ID === $submenu_item[2] ) {
				$settings_submenu_index = $index;
				break;
			}
		}

		if ( null === $elementor_submenu_old_index ) {
			return;
		}

		$elementor_submenu = array_splice( $submenu[ $elementor_menu_slug ], $elementor_submenu_old_index, 1 );

		if ( null !== $settings_submenu_index && $settings_submenu_index > $elementor_submenu_old_index ) {
			$settings_submenu_index--;
		}

		if ( null !== $settings_submenu_index ) {
			array_splice( $submenu[ $elementor_menu_slug ], $settings_submenu_index, 0, $elementor_submenu );
		}
	}
}
