<?php
namespace Elementor\Core\DynamicTags;

use Elementor\Controls_Stack;

use Elementor\Plugin;
use Elementor\Post_CSS_File;
use Elementor\Post_Preview_CSS;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_CSS extends Post_CSS_File {

	protected $post_id_for_data;
	/**
	 * Dynamic_CSS constructor.
	 *
	 * @param Post_CSS_File|Post_Preview_CSS $css_file
	 */
	public function __construct( $css_file ) {
		if ( $css_file instanceof Post_Preview_CSS ) {
			$this->post_id_for_data = $css_file->get_preview_id();
		} else {
			$this->post_id_for_data = $css_file->get_post_id();
		}

		$post_id = $css_file->get_post_id();

		parent::__construct( $post_id );
	}

	public function get_name() {
		return 'dynamic';
	}

	protected function use_external_file() {
		return false;
	}

	protected function get_file_handle_id() {
		return 'elementor-post-dynamic-' . $this->post_id_for_data;
	}

	protected function get_data() {
		return Plugin::$instance->db->get_plain_editor( $this->post_id_for_data );
	}

	public function get_meta( $property = null ) {
		// Parse CSS first, to get the fonts list.
		$css = $this->get_css();

		$meta = [
			'status' => self::CSS_STATUS_INLINE,
			'fonts' => $this->get_fonts(),
			'css' => $css,
		];

		if ( $property ) {
			return isset( $meta[ $property ] ) ? $meta[ $property ] : null;
		}

		return $meta;
	}

	public function add_controls_stack_style_rules( Controls_Stack $controls_stack, array $controls, array $values, array $placeholders, array $replacements ) {
		$dynamic_settings = $controls_stack->get_settings( '__dynamic__' );
		if ( empty( $dynamic_settings ) ) {
			return;
		}

		$controls = array_intersect_key( $controls, $dynamic_settings );

		$all_controls = $controls_stack->get_controls();

		$parsed_dynamic_settings = $controls_stack->parse_dynamic_settings( $values, $controls );

		foreach ( $controls as $control ) {
			if ( ! empty( $control['style_fields'] ) ) {
				$this->add_repeater_control_style_rules( $controls_stack, $control['style_fields'], $values[ $control['name'] ], $placeholders, $replacements );
			}

			if ( empty( $control['selectors'] ) ) {
				continue;
			}

			$this->add_control_style_rules( $control, $parsed_dynamic_settings, $all_controls, $placeholders, $replacements );
		}
	}
}

