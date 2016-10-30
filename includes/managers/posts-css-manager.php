<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Posts_CSS_Manager {

	public function __construct() {
		$this->register_actions();
	}

	public function init() {
		// Create the css directory if it's not exist
		$wp_upload_dir = wp_upload_dir( null, false );
		$css_path = $wp_upload_dir['basedir'] . Post_CSS_File::BASE_DIR;

		if ( ! is_dir( $css_path ) ) {
			wp_mkdir_p( $css_path );

			// Prevent directory index
			file_put_contents( $css_path . '/' . 'index.php', "<?php\n// Silence is golden.\n" );
		}
	}

	public function on_save_post( $post_id ) {
		$css_file = new Post_CSS_File( $post_id );
		$css_file->update();
	}

	public function on_delete_post( $post_id ) {
		$css_file = new Post_CSS_File( $post_id );
		$css_file->delete();
	}

	private function register_actions() {
		add_action( 'init', [ $this, 'init' ] );
		add_action( 'save_post', [ $this, 'on_save_post' ] );
		add_action( 'deleted_post', [ $this, 'on_delete_post' ] );
	}
}
