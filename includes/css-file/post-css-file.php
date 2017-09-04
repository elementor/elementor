<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Post_CSS_File extends CSS_File {

	const META_KEY = '_elementor_css';

	const FILE_PREFIX = 'post-';

	/*
	 * @var int
	 */
	private $post_id;

	/**
	 * Post_CSS_File constructor.
	 *
	 * @param int $post_id
	 */
	public function __construct( $post_id ) {
		$this->post_id = $post_id;

		parent::__construct();
	}

	public function get_name() {
		return 'post';
	}

	/**
	 * @return int
	 */
	public function get_post_id() {
		return $this->post_id;
	}

	/**
	 * @param Element_Base $element
	 *
	 * @return string
	 */
	public function get_element_unique_selector( Element_Base $element ) {
		return '.elementor-' . $this->post_id . ' .elementor-element' . $element->get_unique_selector();
	}

	/**
	 * @return array
	 */
	protected function load_meta() {
		return get_post_meta( $this->post_id, self::META_KEY, true );
	}

	/**
	 * @param string $meta
	 */
	protected function update_meta( $meta ) {
		update_post_meta( $this->post_id, '_elementor_css', $meta );
	}

	protected function render_css() {
		$data = Plugin::$instance->db->get_plain_editor( $this->post_id );

		if ( ! empty( $data ) ) {
			foreach ( $data as $element_data ) {
				$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );

				if ( ! $element ) {
					continue;
				}

				$this->render_styles( $element );
			}
		}
	}

	public function enqueue() {
		if ( ! Plugin::$instance->db->is_built_with_elementor( $this->post_id ) ) {
			return;
		}

		parent::enqueue();
	}

	public function add_controls_stack_style_rules( Controls_Stack $controls_stack, array $controls, array $values, array $placeholders, array $replacements ) {
		parent::add_controls_stack_style_rules( $controls_stack, $controls, $values, $placeholders, $replacements );

		if ( $controls_stack instanceof Element_Base ) {
			foreach ( $controls_stack->get_children() as $child_element ) {
				$this->render_styles( $child_element );
			}
		}
	}

	protected function get_enqueue_dependencies() {
		return [ 'elementor-frontend' ];
	}

	protected function get_inline_dependency() {
		return 'elementor-frontend';
	}

	protected function get_file_handle_id() {
		return 'elementor-post-' . $this->post_id;
	}

	protected function get_file_name() {
		return self::FILE_PREFIX . $this->post_id;
	}

	/**
	 * @param Element_Base $element
	 */
	private function render_styles( Element_Base $element ) {
		$element_settings = $element->get_settings();

		$this->add_controls_stack_style_rules( $element, $element->get_style_controls(), $element_settings,  [ '{{ID}}', '{{WRAPPER}}' ], [ $element->get_id(), $this->get_element_unique_selector( $element ) ] );

		/**
		 * @deprecated, use `elementor/element/parse_css`
		 */
		Utils::do_action_deprecated( 'elementor/element_css/parse_css',[ $this, $element ], '1.0.10', 'elementor/element/parse_css' );

		do_action( 'elementor/element/parse_css', $this, $element );
	}
}
