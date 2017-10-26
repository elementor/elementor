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

	public function __construct( $post_id ) {
		$this->preview_id = $post_id;

		$parent_id = wp_get_post_parent_id( $post_id );

		parent::__construct( $parent_id );
	}

	protected function get_data() {
		return Plugin::$instance->db->get_plain_editor( $this->preview_id );
	}

	public function enqueue() {
		$this->parse_css();
		echo '<style>' . $this->get_css() . '</style>'; // XSS ok.
		// Handle fonts
		if ( ! empty( $this->get_fonts() ) ) {
			foreach ( $this->get_fonts() as $font ) {
				Plugin::$instance->frontend->enqueue_font( $font );
			}
		}
	}
}
