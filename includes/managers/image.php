<?php
namespace Elementor;

use Elementor\Core\Settings\Manager as SettingsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor images manager.
 *
 * Elementor images manager handler class is responsible for retrieving image
 * details.
 *
 * @since 1.0.0
 */
class Images_Manager {

	/**
	 * Get images details.
	 *
	 * Retrieve details for all the images.
	 *
	 * Fired by `wp_ajax_elementor_get_images_details` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function get_images_details() {
		$items = $_POST['items'];
		$urls  = [];

		foreach ( $items as $item ) {
			$urls[ $item['id'] ] = $this->get_details( $item['id'], $item['size'], $item['is_first_time'] );
		}

		wp_send_json_success( $urls );
	}

	/**
	 * Get image details.
	 *
	 * Retrieve single image details.
	 *
	 * Fired by `wp_ajax_elementor_get_image_details` action.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string       $id            Image attachment ID.
	 * @param string|array $size          Image size. Accepts any valid image
	 *                                    size, or an array of width and height
	 *                                    values in pixels (in that order).
	 * @param string       $is_first_time Set 'true' string to force reloading
	 *                                    all image sizes.
	 *
	 * @return array URLs with different image sizes.
	 */
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

	/**
	 * Get Light-Box Image Attributes
	 *
	 * Used to retrieve an array of image attributes to be used for displaying an image in Elementor's Light Box module.
	 *
	 * @param int $id       The ID of the image
	 *
	 * @return array An array of image attributes including `title` and `description`.
	 * @since 2.9.0
	 * @access public
	 */

	public function get_lightbox_image_attributes( $id ) {
		$attributes = [];
		$general_settings_model = SettingsManager::get_settings_managers( 'general' )->get_model();
		$lightbox_title_src = $general_settings_model->get_settings( 'elementor_lightbox_title_src' );
		$lightbox_description_src = $general_settings_model->get_settings( 'elementor_lightbox_description_src' );
		$attachment = get_post( $id );
		$image_data = [
			'alt' => get_post_meta( $attachment->ID, '_wp_attachment_image_alt', true ),
			'caption' => $attachment->post_excerpt,
			'description' => $attachment->post_content,
			'title' => $attachment->post_title,
		];

		if ( $lightbox_title_src && $image_data[ $lightbox_title_src ] ) {
			$attributes['title'] = $image_data[ $lightbox_title_src ];
		}

		if ( $lightbox_description_src && $image_data[ $lightbox_description_src ] ) {
			$attributes['description'] = $image_data[ $lightbox_description_src ];
		}

		return $attributes;
	}

	/**
	 * Images manager constructor.
	 *
	 * Initializing Elementor images manager.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		add_action( 'wp_ajax_elementor_get_images_details', [ $this, 'get_images_details' ] );
	}
}
