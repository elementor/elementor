<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Page_Settings_Manager {

	const TEMPLATE_CANVAS = 'elementor_canvas';

	const META_KEY = '_elementor_page_settings';

	private static $settings = [];

	public function get( $post_id, $setting, $default = null ) {
		$this->get_settings( $post_id );

		if ( isset( $this->settings[ $setting ] ) ) {
			return $this->settings[ $setting ];
		}

		return $default;
	}

	public static function save_page_settings() {
		if ( empty( $_POST['post_id'] ) ) {
			wp_send_json_error( 'You must set the post ID' );
		}

		$post = get_post( $_POST['post_id'] );

		if ( empty( $post ) ) {
			wp_send_json_error( 'Invalid Post' );
		}

		$post->post_title = $_POST['post_title'];

		$post->post_status = $_POST['post_status'];

		$saved = wp_update_post( $post );

			update_post_meta( $post->ID, '_wp_page_template', $_POST['template'] );
		}

		$elementor_page_settings['content_width'] = $_POST['content_width'];

		update_post_meta( $post->ID, self::META_KEY, $elementor_page_settings );

		$css_file = new Post_CSS_File( $post->ID );

		$css_file->update();

		if ( $saved ) {
			wp_send_json_success();
		} else {
			wp_send_json_error();
		}
	}

	public function get_settings( $post_id ) {
		if ( null === $this->settings ) {
			$post = get_post( $post_id );

			if ( ! $post ) {
				return [];
			}

			$defaults = [
				'post_id' => $post->ID,
				'post_title' => $post->post_title,
				'post_status' => $post->post_status,
				'template' => get_post_meta( $post->ID, '_wp_page_template', true ),
				'content_width' => '',
			];

			$this->settings = array_merge( $defaults, (array) get_post_meta( $post_id, self::META_KEY, true ) );
		}

		return $this->settings;
	}

	public static function template_include( $template ) {
		if ( self::TEMPLATE_CANVAS === get_post_meta( get_the_ID(), '_wp_page_template', true ) ) {
			$template = ELEMENTOR_PATH . '/includes/page-templates/empty.php';
		}

		return $template;
	}

	public static function add_page_templates( $post_templates ) {
		$post_templates = [
				self::TEMPLATE_CANVAS => __( 'Elementor', 'elementor' ) . ' ' . __( 'Canvas', 'elementor' ),
		] + $post_templates;

		return $post_templates;
	}

	public static function is_cpt_custom_templates_supported() {
		require_once ABSPATH . '/wp-admin/includes/theme.php';

		return method_exists( wp_get_theme(), 'get_post_templates' );
	}

	public function __construct() {
		if ( Utils::is_ajax() ) {
			add_action( 'wp_ajax_elementor_save_page_settings', [ __CLASS__, 'save_page_settings' ] );
		}

		$post_types = get_option( 'elementor_cpt_support', [] );

		$post_types[] = 'elementor_library';

		foreach ( $post_types as $post_type ) {
			add_filter( "theme_{$post_type}_templates", [ __CLASS__, 'add_page_templates' ], 10, 4 );
		}

		add_filter( 'template_include', [ __CLASS__, 'template_include' ] );
	}
}
