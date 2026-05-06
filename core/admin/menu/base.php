<?php
namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Base\Base_Object;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @deprecated 3.34.2 Elementor menu items are now registered inside Elementor\Core\Admin\EditorOneMenu. Use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager instead.
 */
abstract class Base extends Base_Object {

	private $deprecation_notice = 'Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager and the \'elementor/editor-one/menu/register\' hook';

	private $args;

	private $submenus = [];

	abstract protected function get_init_args();

	public function __construct() {
		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->deprecated_function( get_class( $this ) . '::__construct', '3.34.2', $this->deprecation_notice );

		$this->init_args();

		add_action( 'admin_menu', function() {
			$this->register();
		} );
	}

	/**
	 * @deprecated 3.34.2 Use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager instead.
	 */
	public function get_args( $arg = null ) {
		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->deprecated_function( __METHOD__, '3.34.2', $this->deprecation_notice );

		return self::get_items( $this->args, $arg );
	}

	/**
	 * @deprecated 3.34.2 Use Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager instead.
	 */
	public function add_submenu( $submenu_args ) {
		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->deprecated_function( __METHOD__, '3.34.2', $this->deprecation_notice );

		$default_submenu_args = [
			'page_title' => '',
			'capability' => $this->args['capability'],
			'function' => null,
			'index' => null,
		];

		$this->submenus[] = array_merge( $default_submenu_args, $submenu_args );
	}

	protected function register_default_submenus() {}

	protected function register() {
		$args = $this->args;

		add_menu_page( $args['page_title'], $args['menu_title'], $args['capability'], $args['menu_slug'], $args['function'], $args['icon_url'], $args['position'] );

		$this->register_default_submenus();

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->do_deprecated_action( 'elementor/admin/menu_registered/' . $args['menu_slug'], [ $this ], '3.34.2', $this->deprecation_notice );

		usort( $this->submenus, function( $a, $b ) {
			return $a['index'] - $b['index'];
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

				$submenu[ $args['menu_slug'] ][ $index + 1 ][4] = $submenu_item['class']; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			}
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
}
