<?php
namespace Elementor\TemplateLibrary;

use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Source_Base {

	abstract public function get_id();
	abstract public function get_title();
	abstract public function register_data();
	abstract public function get_items( $args = [] );
	abstract public function get_item( $template_id );
	abstract public function get_data( array $args );
	abstract public function delete_template( $template_id );
	abstract public function save_item( $template_data );
	abstract public function update_item( $new_data );
	abstract public function export_template( $template_id );

	public function __construct() {
		$this->register_data();
	}

	protected function replace_elements_ids( $content ) {
		return Plugin::$instance->db->iterate_data( $content, function( $element ) {
			$element['id'] = Utils::generate_random_string();

			return $element;
		} );
	}

	/**
	 * @param array  $content a set of elements
	 * @param string $method  (on_export|on_import)
	 *
	 * @return mixed
	 */
	protected function process_export_import_content( $content, $method ) {
		return Plugin::$instance->db->iterate_data( $content, function( $element_data ) use ( $method ) {
			$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );

			// If the widget/element isn't exist, like a plugin that creates a widget but deactivated
			if ( ! $element ) {
				return null;
			}

			return $this->process_element_export_import_content( $element, $method );
		} );
	}

	/**
	 * @param \Elementor\Controls_Stack $element
	 * @param string $method
	 *
	 * @return array
	 */
	protected function process_element_export_import_content( $element, $method ) {
		$element_data = $element->get_data();

		if ( method_exists( $element, $method ) ) {
			// TODO: Use the internal element data without parameters
			$element_data = $element->{$method}( $element_data );
		}

		foreach ( $element->get_controls() as $control ) {
			$control_class = Plugin::$instance->controls_manager->get_control( $control['type'] );

			// If the control isn't exist, like a plugin that creates the control but deactivated
			if ( ! $control_class ) {
				return $element_data;
			}

			if ( method_exists( $control_class, $method ) ) {
				$element_data['settings'][ $control['name'] ] = $control_class->{$method}( $element->get_settings( $control['name'] ) );
			}
		}

		return $element_data;
	}
}
