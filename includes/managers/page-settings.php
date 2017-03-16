<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Page_Settings_Manager {

	const TEMPLATE_CANVAS = 'elementor_canvas';

	const META_KEY = '_elementor_page_settings';

	private $settings = null;

	public function get( $setting, $default = null ) {
		$this->get_settings( get_the_ID() );

		if ( isset( $this->settings[ $setting ] ) ) {
			return $this->settings[ $setting ];
		}

		return $default;
	}

	public function save_page_settings() {
		if ( empty( $_POST['post_id'] ) ) {
			wp_send_json_error( 'You must set the post ID' );
		}

		$post = get_post( $_POST['post_id'] );

		if ( empty( $post ) ) {
			wp_send_json_error( 'Invalid Post' );
		}

		if ( ! empty( $_POST['post_title'] ) ) {
			$post->post_title = $_POST['post_title'];
		}

		if ( ! empty( $_POST['post_status'] ) ) {
			$post->post_status = $_POST['post_status'];
		}

		$saved = wp_update_post( $post );

		if ( ! empty( $_POST['template'] ) ) {
			update_post_meta( $post->ID, '_wp_page_template', $_POST['template'] );
		}

		$elementor_page_settings['content_width'] = $_POST['content_width'];

		update_post_meta( $post->ID, self::META_KEY, $elementor_page_settings );

		if ( $saved ) {
			wp_send_json_success();
		} else {
			wp_send_json_error();
		}
	}

	public function get_settings( $post_id = null ) {
		if ( null === $this->settings ) {
			$post = get_post( $post_id );

			if ( ! $post ) {
				return [];
			}

			$defaults = [
				'post_id'       => $post->ID,
				'post_title'    => $post->post_title,
				'post_status'   => $post->post_status,
				'template'      => get_post_meta( $post->ID, '_wp_page_template', true ),
				'content_width' => '',
			];

			$this->settings = array_merge( $defaults, get_post_meta( get_the_ID(), self::META_KEY, true ) );
		}

		return $this->settings;
	}

	public function template_include( $template ) {
		if ( self::TEMPLATE_CANVAS === get_post_meta( get_the_ID(), '_wp_page_template', true ) ) {
			$template = ELEMENTOR_PATH . '/includes/templates/empty.php';
		}
		return $template;
	}

	public function add_page_templates( $post_templates, $wp_theme, $post, $post_type ) {
		$post_templates = [
				self::TEMPLATE_CANVAS => __( 'Elementor', 'elementor' ) . ' ' . __( 'Canvas', 'elementor' ),
		] + $post_templates;

		return $post_templates;
	}

	public function __construct() {
		if ( Utils::is_ajax() ) {
			add_action( 'wp_ajax_elementor_save_page_settings', [ $this, 'save_page_settings' ] );
		}

		$post_types = get_option( 'elementor_cpt_support', [] );
		$post_types[] = 'elementor_library';
		foreach ( $post_types as $post_type ) {
			add_filter( "theme_{$post_type}_templates", [ $this, 'add_page_templates' ], 10, 4 );
		}
		add_filter( 'template_include', [ $this, 'template_include' ] );
	}
}
