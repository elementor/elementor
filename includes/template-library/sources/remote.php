<?php
namespace Elementor\TemplateLibrary;

use Elementor\Api;
use Elementor\PageSettings\Page;

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
			'hasPageSettings' => ( '1' === $template_data['has_page_settings'] ),
			'url' => $template_data['url'],
		];
	}

	public function save_item( $template_data ) {
		return false;
	}

	public function update_item( $new_data ) {
		return false;
	}

	public function delete_template( $template_id ) {
		return false;
	}

	public function export_template( $template_id ) {
		return false;
	}

	public function get_data( array $args, $context = 'display' ) {
		$data = Api::get_template_content( $args['template_id'] );

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		// TODO: since 1.5.0 to content container named `content` instead of `data`
		if ( ! empty( $data['data'] ) ) {
			$data['content'] = $data['data'];
			unset( $data['data'] );
		}

		$data['content'] = $this->replace_elements_ids( $data['content'] );
		$data['content'] = $this->process_export_import_content( $data['content'], 'on_import' );

		if ( ! empty( $args['page_settings'] ) && ! empty( $data['page_settings'] ) ) {
			$page = new Page( [
				'settings' => $data['page_settings'],
			] );

			$page_settings_data = $this->process_element_export_import_content( $page, 'on_import' );
			$data['page_settings'] = $page_settings_data['settings'];
		}

		return $data;
	}
}
