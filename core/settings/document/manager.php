<?php
namespace Elementor\Core\Settings\Document;

use Elementor\CSS_File;
use Elementor\Core\Settings\Base\Manager as BaseManager;
use Elementor\Core\Settings\Base\Model as BaseModel;
use Elementor\Plugin;
use Elementor\Post_CSS_File;
use Elementor\Utils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manager extends BaseManager {

	const META_KEY = '_elementor_page_settings';

	public function get_name() {
		return 'document';
	}

	public function get_model( $id = 0 ) {
		if ( $id ) {
			return Plugin::$instance->documents->get( $id );
		}

		return Plugin::$instance->documents->get_current();
	}

	public function get_model_for_config() {
		$model = $this->get_model();

		if ( $model->get_autosave_id() ) {
			$model = $model->get_autosave();
		}
		return $model;
	}

	protected function ajax_before_save_settings( array $data, $id ) {}

	protected function save_settings_to_db( array $settings, $id ) {
		// Use `update_metadata|delete_metadata` to handle also revisions.
		if ( ! empty( $settings ) ) {
			update_metadata( 'post', $id, self::META_KEY, $settings );
		} else {
			delete_metadata( 'post',  $id, self::META_KEY );
		}
	}

	protected function get_css_file_for_update( $id ) {
		return new Post_CSS_File( $id );
	}

	protected function get_saved_settings( $id ) {}

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
