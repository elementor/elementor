<?php
namespace Elementor\TemplateLibrary;

use Elementor\Api;
use Elementor\Controls_Manager;
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

	public function get_items() {
		$templates_data = Api::get_templates_data();

		$templates = [];
		if ( ! empty( $templates_data ) ) {
			foreach ( $templates_data as $template_data ) {
				$templates[] = $this->get_item( $template_data );
			}
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
			'url' => $template_data['url'],
		];
	}

	public function save_item( $template_data ) {
		return false;
	}

	public function delete_template( $item_id ) {
		return false;
	}

	public function get_content( $item_id, $context = 'display' ) {
		$data = Api::get_template_content( $item_id );
		if ( ! $data ) {
			return false;
		}

		// Fetch all images and replace to new
		$import_images = new Classes\Import_Images();

		$content_data = Plugin::instance()->db->iterate_data( $data, function( $element ) use ( $import_images ) {
			$element['id'] = Utils::generate_random_string();

			if ( 'widget' === $element['elType'] ) {
				$obj = Plugin::instance()->widgets_manager->get_widget( $element['widgetType'] );
			} else {
				$obj = Plugin::instance()->elements_manager->get_element( $element['elType'] );
			}

			if ( ! $obj )
				return $element;

			foreach ( $obj->get_controls() as $control ) {
				if ( Controls_Manager::MEDIA === $control['type'] ) {
					if ( empty( $element['settings'][ $control['name'] ]['url'] ) )
						continue;

					$element['settings'][ $control['name'] ] = $import_images->import( $element['settings'][ $control['name'] ] );
				}

				if ( Controls_Manager::GALLERY === $control['type'] ) {
					foreach ( $element['settings'][ $control['name'] ] as &$attachment ) {
						if ( empty( $attachment['url'] ) )
							continue;

						$attachment = $import_images->import( $attachment );
					}
				}
			}

			return $element;
		} );

		return $content_data;
	}
}
