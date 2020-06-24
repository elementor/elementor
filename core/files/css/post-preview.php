<?php
namespace Elementor\Core\Files\CSS;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor post preview CSS file.
 *
 * Elementor CSS file handler class is responsible for generating the post
 * preview CSS file.
 *
 * @since 1.9.0
 */
class Post_Preview extends Post {

	/**
	 * Preview ID.
	 *
	 * Holds the ID of the current post being previewed.
	 *
	 * @var int
	 */
	private $preview_id;

	/**
	 * Post preview CSS file constructor.
	 *
	 * Initializing the CSS file of the post preview. Set the post ID and the
	 * parent ID and initiate the stylesheet.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param int $post_id Post ID.
	 */
	public function __construct( $post_id ) {
		$this->preview_id = $post_id;

		$parent_id = wp_get_post_parent_id( $post_id );

		parent::__construct( $parent_id );
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function get_preview_id() {
		return $this->preview_id;
	}

	/**
	 * Get data.
	 *
	 * Retrieve raw post data from the database.
	 *
	 * @since 1.9.0
	 * @access protected
	 *
	 * @return array Post data.
	 */
	protected function get_data() {
		$document = Plugin::$instance->documents->get( $this->preview_id );
		return $document ? $document->get_elements_data() : [];
	}

	/**
	 * Get file handle ID.
	 *
	 * Retrieve the handle ID for the previewed post CSS file.
	 *
	 * @since 1.9.0
	 * @access protected
	 *
	 * @return string CSS file handle ID.
	 */
	protected function get_file_handle_id() {
		return 'elementor-preview-' . $this->preview_id;
	}

	/**
	 * Get meta data.
	 *
	 * Retrieve the previewed post CSS file meta data.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param string $property Optional. Custom meta data property. Default is
	 *                         null.
	 *
	 * @return array Previewed post CSS file meta data.
	 */
	public function get_meta( $property = null ) {
		// Parse CSS first, to get the fonts list.
		$css = $this->get_content();

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
}
