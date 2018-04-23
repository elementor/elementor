<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor post CSS file.
 *
 * Elementor CSS file handler class is responsible for generating the single
 * post CSS file.
 *
 * @since 1.2.0
 */
class Post_CSS_File extends CSS_File {

	/**
	 * Elementor post CSS file meta key.
	 */
	const META_KEY = '_elementor_css';

	/**
	 * Elementor post CSS file prefix.
	 */
	const FILE_PREFIX = 'post-';

	/**
	 * Post ID.
	 *
	 * Holds the current post ID.
	 *
	 * @var int
	 */
	private $post_id;

	/**
	 * Post CSS file constructor.
	 *
	 * Initializing the CSS file of the post. Set the post ID and initiate the stylesheet.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 */
	public function __construct( $post_id ) {
		$this->post_id = $post_id;

		parent::__construct();
	}

	/**
	 * Get CSS file name.
	 *
	 * Retrieve the CSS file name.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @return string CSS file name.
	 */
	public function get_name() {
		return 'post';
	}

	/**
	 * Get post ID.
	 *
	 * Retrieve the ID of current post.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @return int Post ID.
	 */
	public function get_post_id() {
		return $this->post_id;
	}

	/**
	 * Get unique element selector.
	 *
	 * Retrieve the unique selector for any given element.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @param Element_Base $element The element.
	 *
	 * @return string Unique element selector.
	 */
	public function get_element_unique_selector( Element_Base $element ) {
		return '.elementor-' . $this->post_id . ' .elementor-element' . $element->get_unique_selector();
	}

	/**
	 * Load meta data.
	 *
	 * Retrieve the post CSS file meta data.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return array Post CSS file meta data.
	 */
	protected function load_meta() {
		return get_post_meta( $this->post_id, static::META_KEY, true );
	}

	/**
	 * Update meta data.
	 *
	 * Update the global CSS file meta data.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @param array $meta New meta data.
	 */
	protected function update_meta( $meta ) {
		update_post_meta( $this->post_id, static::META_KEY, $meta );
	}

	/**
	 * Get post data.
	 *
	 * Retrieve raw post data from the database.
	 *
	 * @since 1.9.0
	 * @access protected
	 *
	 * @return array Post data.
	 */
	protected function get_data() {
		return Plugin::$instance->db->get_plain_editor( $this->post_id );
	}

	/**
	 * Render CSS.
	 *
	 * Parse the CSS for all the elements.
	 *
	 * @since 1.2.0
	 * @access protected
	 */
	protected function render_css() {
		$data = $this->get_data();

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

	/**
	 * Enqueue CSS.
	 *
	 * Enqueue the post CSS file in Elementor.
	 *
	 * This method ensures that the post was actually built with elementor before
	 * enqueueing the post CSS file.
	 *
	 * @since 1.2.2
	 * @access public
	 */
	public function enqueue() {
		if ( ! Plugin::$instance->db->is_built_with_elementor( $this->post_id ) ) {
			return;
		}

		parent::enqueue();
	}

	/**
	 * Add controls-stack style rules.
	 *
	 * Parse the CSS for all the elements inside any given controls stack.
	 *
	 * This method recursively renders the CSS for all the child elements in the stack.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @param Controls_Stack $controls_stack The controls stack.
	 * @param array          $controls       Controls array.
	 * @param array          $values         Values array.
	 * @param array          $placeholders   Placeholders.
	 * @param array          $replacements   Replacements.
	 */
	public function add_controls_stack_style_rules( Controls_Stack $controls_stack, array $controls, array $values, array $placeholders, array $replacements ) {
		parent::add_controls_stack_style_rules( $controls_stack, $controls, $values, $placeholders, $replacements );

		if ( $controls_stack instanceof Element_Base ) {
			foreach ( $controls_stack->get_children() as $child_element ) {
				$this->render_styles( $child_element );
			}
		}
	}

	/**
	 * Get enqueue dependencies.
	 *
	 * Retrieve the name of the stylesheet used by `wp_enqueue_style()`.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return array Name of the stylesheet.
	 */
	protected function get_enqueue_dependencies() {
		return [ 'elementor-frontend' ];
	}

	/**
	 * Get inline dependency.
	 *
	 * Retrieve the name of the stylesheet used by `wp_add_inline_style()`.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return string Name of the stylesheet.
	 */
	protected function get_inline_dependency() {
		return 'elementor-frontend';
	}

	/**
	 * Get file handle ID.
	 *
	 * Retrieve the handle ID for the post CSS file.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return string CSS file handle ID.
	 */
	protected function get_file_handle_id() {
		return 'elementor-post-' . $this->post_id;
	}

	/**
	 * Get file name.
	 *
	 * Retrieve the name of the post CSS file.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return string File name.
	 */
	protected function get_file_name() {
		return self::FILE_PREFIX . $this->post_id;
	}

	/**
	 * Render styles.
	 *
	 * Parse the CSS for any given element.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @param Element_Base $element The element.
	 */
	protected function render_styles( Element_Base $element ) {
		/**
		 * Before element parse CSS.
		 *
		 * Fires before the CSS of the element is parsed.
		 *
		 * @since 1.2.0
		 *
		 * @param Post_CSS_File $this    The post CSS file.
		 * @param Element_Base  $element The element.
		 */
		do_action( 'elementor/element/before_parse_css', $this, $element );

		$element_settings = $element->get_settings();

		$this->add_controls_stack_style_rules( $element, $element->get_style_controls(), $element_settings,  [ '{{ID}}', '{{WRAPPER}}' ], [ $element->get_id(), $this->get_element_unique_selector( $element ) ] );

		/**
		 * After element parse CSS.
		 *
		 * Fires after the CSS of the element is parsed.
		 *
		 * @since 1.2.0
		 *
		 * @param Post_CSS_File $this    The post CSS file.
		 * @param Element_Base  $element The element.
		 */
		do_action( 'elementor/element/parse_css', $this, $element );
	}
}
