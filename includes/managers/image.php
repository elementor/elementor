<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Images_Manager {

	public function get_images_details() {
		$items = $_POST['items'];
		$urls  = [];

		foreach ( $items as $item ) {
			$urls[ $item['id'] ] = $this->get_details( $item['id'], $item['size'], $item['is_first_time'] );
		}

		wp_send_json_success( $urls );
	}

	public function get_details( $id, $size, $is_first_time ) {
		if ( ! class_exists( 'Group_Control_Image_Size' ) ) {
			require_once ELEMENTOR_PATH . '/includes/controls/groups/image-size.php';
		}

		if ( 'true' === $is_first_time ) {
			$sizes = get_intermediate_image_sizes();
			$sizes[] = 'full';
		} else {
			$sizes = [];
		}

		$sizes[] = $size;
		$urls = [];
		foreach ( $sizes as $size ) {
			if ( 0 === strpos( $size, 'custom_' ) ) {
				preg_match( '/custom_(\d*)x(\d*)/', $size, $matches );

				$instance = [
					'image_size' => 'custom',
					'image_custom_dimension' => [
						'width' => $matches[1],
						'height' => $matches[2],
					],
				];

				$urls[ $size ] = Group_Control_Image_Size::get_attachment_image_src( $id, 'image', $instance );
			} else {
				$urls[ $size ] = wp_get_attachment_image_src( $id, $size )[0];
			}
		}

		return $urls;
	}

	public function __construct() {
		add_action( 'wp_ajax_elementor_get_image_details', [ $this, 'get_image_details' ] );
		add_action( 'wp_ajax_elementor_get_images_details', [ $this, 'get_images_details' ] );
	}
}

new Images_Manager();
