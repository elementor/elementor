<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Post_Preview_CSS extends Post_CSS_File {
	/*
    * @var int
	*/
	private $preview_id;

	/**
	 * @since 1.9.0
	 * @access public
	 */
	public function __construct( $post_id ) {
		$this->preview_id = $post_id;

		$parent_id = wp_get_post_parent_id( $post_id );

		parent::__construct( $parent_id );
	}

	/**
	 * @since 1.9.0
	 * @access protected
	 */
	protected function get_data() {
		return Plugin::$instance->db->get_plain_editor( $this->preview_id );
	}

	/**
	 * @since 1.9.0
	 * @access protected
	 */
	protected function get_file_handle_id() {
		return 'elementor-preview-' . $this->preview_id;
	}

	/**
	 * @since 1.9.0
	 * @access public
	 */
	public function get_meta( $property = null ) {
		// Parse CSS first, to get the fonts list.
		$css = $this->get_css();

		return [
			'status' => self::CSS_STATUS_INLINE,
			'fonts' => $this->get_fonts(),
			'css' => $css,
		];
	}
}
