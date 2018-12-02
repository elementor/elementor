<?php
namespace Elementor\Core\DynamicTags;

use Elementor\Controls_Stack;
use Elementor\Core\Files\CSS\Post;
use Elementor\Plugin;
use Elementor\Element_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_CSS extends Post {

	protected $post_id_for_data;
	/**
	 * Dynamic_CSS constructor.
	 *
	 * @since 2.0.13
	 * @access public
	 * @param int $post_id Post ID
	 * @param int $post_id_for_data
	 */
	public function __construct( $post_id, $post_id_for_data ) {
		$this->post_id_for_data = $post_id_for_data;

		parent::__construct( $post_id );
	}

	/**
	 * @since 2.0.13
	 * @access public
	 */
	public function get_name() {
		return 'dynamic';
	}

	/**
	 * @since 2.0.13
	 * @access protected
	 */
	protected function use_external_file() {
		return false;
	}

	/**
	 * @since 2.0.13
	 * @access protected
	 */
	protected function get_file_handle_id() {
		return 'elementor-post-dynamic-' . $this->post_id_for_data;
	}

	/**
	 * @since 2.0.13
	 * @access protected
	 */
	protected function get_data() {
		return Plugin::$instance->db->get_plain_editor( $this->post_id_for_data );
	}

	/**
	 * @since 2.0.13
	 * @access public
	 */
	public function get_meta( $property = null ) {
		// Parse CSS first, to get the fonts list.
		$css = $this->get_content();

		$meta = [
			'status' => $css ? self::CSS_STATUS_INLINE : self::CSS_STATUS_EMPTY,
			'fonts' => $this->get_fonts(),
			'css' => $css,
		];

		if ( $property ) {
			return isset( $meta[ $property ] ) ? $meta[ $property ] : null;
		}

		return $meta;
	}

	/**
	 * @since 2.0.13
	 * @access public
	 */
	public function add_controls_stack_style_rules( Controls_Stack $controls_stack, array $controls, array $values, array $placeholders, array $replacements, array $all_controls = null ) {
		$dynamic_settings = $controls_stack->get_settings( '__dynamic__' );
		if ( ! empty( $dynamic_settings ) ) {
			$controls = array_intersect_key( $controls, $dynamic_settings );

			$all_controls = $controls_stack->get_controls();

			$parsed_dynamic_settings = $controls_stack->parse_dynamic_settings( $values, $controls );

			foreach ( $controls as $control ) {
				if ( ! empty( $control['style_fields'] ) ) {
					$this->add_repeater_control_style_rules( $controls_stack, $control, $values[ $control['name'] ], $placeholders, $replacements );
				}

				if ( empty( $control['selectors'] ) ) {
					continue;
				}

				$this->add_control_style_rules( $control, $parsed_dynamic_settings, $all_controls, $placeholders, $replacements );
			}
		}

		if ( $controls_stack instanceof Element_Base ) {
			foreach ( $controls_stack->get_children() as $child_element ) {
				$this->render_styles( $child_element );
			}
		}
	}
}
