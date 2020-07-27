<?php
namespace Elementor\Core\DynamicTags;

use Elementor\Controls_Stack;
use Elementor\Core\Files\CSS\Post;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Plugin;
use Elementor\Element_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_CSS extends Post {

	private $post_dynamic_elements_ids;

	protected $post_id_for_data;

	protected function is_global_parsing_supported() {
		return false;
	}

	protected function is_sync_enabled() {
		return false;
	}

	protected function render_styles( Element_Base $element ) {
		$id = $element->get_id();

		if ( in_array( $id, $this->post_dynamic_elements_ids ) ) {
			parent::render_styles( $element );
		}

		foreach ( $element->get_children() as $child_element ) {
			$this->render_styles( $child_element );
		}
	}

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

		$post_css_file = Post_CSS::create( $post_id_for_data );

		$this->post_dynamic_elements_ids = $post_css_file->get_meta( 'dynamic_elements_ids' );

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
		$document = Plugin::$instance->documents->get( $this->post_id_for_data );
		return $document ? $document->get_elements_data() : [];
	}

	public function is_update_required() {
		return true;
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
	}
}
