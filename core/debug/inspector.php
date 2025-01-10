<?php
namespace Elementor\Core\Debug;

use Elementor\Settings;
use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Inspector {

	protected $is_enabled = false;

	protected $log = array();

	/**
	 * @since 2.1.2
	 * @access public
	 */
	public function __construct() {
		$is_debug = ( defined( 'WP_DEBUG' ) && WP_DEBUG );
		$option = get_option( 'elementor_enable_inspector', null );

		$this->is_enabled = is_null( $option ) ? $is_debug : 'enable' === $option;

		if ( $this->is_enabled ) {
			add_action( 'admin_bar_menu', array( $this, 'add_menu_in_admin_bar' ), 201 );
		}

		add_action( 'elementor/admin/after_create_settings/' . Tools::PAGE_ID, array( $this, 'register_admin_tools_fields' ), 50 );
	}

	/**
	 * @since 2.1.3
	 * @access public
	 */
	public function is_enabled() {
		return $this->is_enabled;
	}

	/**
	 * @since 2.1.3
	 * @access public
	 */
	public function register_admin_tools_fields( Tools $tools ) {
		$tools->add_fields( Settings::TAB_GENERAL, 'tools', array(
			'enable_inspector' => array(
				'label' => esc_html__( 'Debug Bar', 'elementor' ),
				'field_args' => array(
					'type' => 'select',
					'std' => $this->is_enabled ? 'enable' : '',
					'options' => array(
						'' => esc_html__( 'Disable', 'elementor' ),
						'enable' => esc_html__( 'Enable', 'elementor' ),
					),
					'desc' => esc_html__( 'Debug Bar adds an admin bar menu that lists all the templates that are used on a page that is being displayed.', 'elementor' ),
				),
			),
		) );
	}

	/**
	 * @since 2.1.2
	 * @access public
	 */
	public function parse_template_path( $template ) {
		// `untrailingslashit` for windows path style.
		if ( 0 === strpos( $template, untrailingslashit( ELEMENTOR_PATH ) ) ) {
			return 'Elementor - ' . basename( $template );
		}

		if ( 0 === strpos( $template, get_stylesheet_directory() ) ) {
			return wp_get_theme()->get( 'Name' ) . ' - ' . basename( $template );
		}

		$plugins_dir = dirname( ELEMENTOR_PATH );
		if ( 0 === strpos( $template, $plugins_dir ) ) {
			return ltrim( str_replace( $plugins_dir, '', $template ), '/\\' );
		}

		return str_replace( WP_CONTENT_DIR, '', $template );
	}

	/**
	 * @since 2.1.2
	 * @access public
	 */
	public function add_log( $module, $title, $url = '' ) {
		if ( ! $this->is_enabled ) {
			return;
		}

		if ( ! isset( $this->log[ $module ] ) ) {
			$this->log[ $module ] = array();
		}

		$this->log[ $module ][] = array(
			'title' => $title,
			'url' => $url,
		);
	}

	/**
	 * @since 2.1.2
	 * @access public
	 */
	public function add_menu_in_admin_bar( \WP_Admin_Bar $wp_admin_bar ) {
		if ( empty( $this->log ) ) {
			return;
		}

		$wp_admin_bar->add_node( array(
			'id' => 'elementor_inspector',
			'title' => esc_html__( 'Elementor Debugger', 'elementor' ),
		) );

		foreach ( $this->log as $module => $log ) {
			$module_id = sanitize_key( $module );

			$wp_admin_bar->add_menu( array(
				'id' => 'elementor_inspector_' . $module_id,
				'parent' => 'elementor_inspector',
				'title' => $module,
			) );

			foreach ( $log as $index => $row ) {
				$url = $row['url'];

				unset( $row['url'] );

				$wp_admin_bar->add_menu( array(
					'id' => 'elementor_inspector_log_' . $module_id . '_' . $index,
					'parent' => 'elementor_inspector_' . $module_id,
					'href' => $url,
					'title' => implode( ' > ', $row ),
					'meta' => array(
						'target' => '_blank',
					),
				) );
			}
		}
	}
}
