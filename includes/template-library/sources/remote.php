<?php
namespace Elementor\TemplateLibrary;

use Elementor\Api;
use Elementor\Controls_Manager;
use Elementor\Element_Base;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Source_Remote extends Source_Base {

	public function get_id() {
		return 'remote';
	}

	public function get_title() {
		return __( 'Remote', 'elementor' );
	}

	public function register_data() {}

	public function get_items( $args = [] ) {
		$templates_data = Api::get_templates_data();

		$templates = [];
		if ( ! empty( $templates_data ) ) {
			foreach ( $templates_data as $template_data ) {
				$templates[] = $this->get_item( $template_data );
			}
		}

		if ( ! empty( $args ) ) {
			$templates = wp_list_filter( $templates, $args );
		}

		return $templates;
	}

	/**
	 * @param array $template_data
	 *
	 * @return array
	 */
	public function get_item( $template_data ) {
		return [
			'template_id' => $template_data['id'],
			'source' => $this->get_id(),
			'title' => $template_data['title'],
			'thumbnail' => $template_data['thumbnail'],
			'date' => date( get_option( 'date_format' ), $template_data['tmpl_created'] ),
			'author' => $template_data['author'],
			'categories' => [],
			'keywords' => [],
			'isPro' => ( '1' === $template_data['is_pro'] ),
			'url' => $template_data['url'],
		];
	}

	public function save_item( $template_data ) {
		return false;
	}

	public function update_item( $new_data ) {
		return false;
	}

	public function delete_template( $item_id ) {
		return false;
	}

	public function export_template( $item_id ) {
		return false;
	}

	public function get_content( $item_id, $context = 'display' ) {
		$data = Api::get_template_content( $item_id );

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		$data = $this->replace_elements_ids( $data );

		$data = $this->process_export_import_data( $data, 'on_import' );

		return $data;
	}
}
