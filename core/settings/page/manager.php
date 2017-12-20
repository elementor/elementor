<?php
namespace Elementor\Core\Settings\Page;

use Elementor\CSS_File;
use Elementor\Core\Settings\Base\Manager as BaseManager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Core\Settings\Base\Model as BaseModel;
use Elementor\Post_CSS_File;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manager extends BaseManager {

	const META_KEY = '_elementor_page_settings';

	/**
	 * @deprecated since 1.6.0
	 *
	 * @param int $id
	 *
	 * @return BaseModel
	 */
	public static function get_page( $id ) {
		return SettingsManager::get_settings_managers( 'page' )->get_model( $id );
	}

	public function get_name() {
		return 'page';
	}

	/**
	 * @return BaseModel
	 */
	public function get_model_for_config() {
		return $this->get_model( get_the_ID() );
	}

	protected function ajax_before_save_settings( array $data, $id ) {
		$post = get_post( $id );

		if ( empty( $post ) ) {
			wp_send_json_error( 'Invalid Post' );
		}

		if ( ! current_user_can( 'edit_post', $id ) ) {
			wp_send_json_error( __( 'Access Denied.', 'elementor' ) );
		}

		// Avoid save empty post title.
		if ( ! empty( $data['post_title'] ) ) {
			$post->post_title = $data['post_title'];
		}

		if ( isset( $data['post_excerpt'] ) && post_type_supports( $post->post_type, 'excerpt' ) ) {
			$post->post_excerpt = $data['post_excerpt'];
		}

		$allowed_post_statuses = get_post_statuses();

		if ( isset( $data['post_status'] ) && isset( $allowed_post_statuses[ $data['post_status'] ] ) ) {
			$post_type_object = get_post_type_object( $post->post_type );
			if ( 'publish' !== $data['post_status'] || current_user_can( $post_type_object->cap->publish_posts ) ) {
				$post->post_status = $data['post_status'];
			}
		}

		wp_update_post( $post );

		if ( Utils::is_cpt_custom_templates_supported() ) {
			$template = 'default';

			if ( isset( $data['template'] ) ) {
				$template = $data['template'];
			}

			update_post_meta( $post->ID, '_wp_page_template', $template );
		}
	}

	protected function save_settings_to_db( array $settings, $id ) {
		if ( ! empty( $settings ) ) {
			update_post_meta( $id, self::META_KEY, $settings );
		} else {
			delete_post_meta( $id, self::META_KEY );
		}
	}

	protected function get_css_file_for_update( $id ) {
		return new Post_CSS_File( $id );
	}

	protected function get_saved_settings( $id ) {
		$settings = get_post_meta( $id, self::META_KEY, true );

		if ( ! $settings ) {
			$settings = [];
		}

		if ( Utils::is_cpt_custom_templates_supported() ) {
			$saved_template = get_post_meta( $id, '_wp_page_template', true );

			if ( $saved_template ) {
				$settings['template'] = $saved_template;
			}
		}

		return $settings;
	}

	protected function get_css_file_name() {
		return 'post';
	}

	/**
	 * @param CSS_File $css_file
	 *
	 * @return BaseModel
	 */
	protected function get_model_for_css_file( CSS_File $css_file ) {
		if ( ! $css_file instanceof Post_CSS_File ) {
			return null;
		}

		return $this->get_model( $css_file->get_post_id() );
	}

	protected function get_special_settings_names() {
		return [
			'id',
			'post_title',
			'post_status',
			'template',
		];
	}
}
