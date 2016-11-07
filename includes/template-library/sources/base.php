<?php
namespace Elementor\TemplateLibrary;

use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Source_Base {

	abstract public function get_id();
	abstract public function get_title();
	abstract public function register_data();
	abstract public function get_items();
	abstract public function get_item( $item_id );
	abstract public function get_content( $item_id );
	abstract public function delete_template( $item_id );
	abstract public function save_item( $template_data );
	abstract public function update_item( $new_data );
	abstract public function export_template( $item_id );

	public function __construct() {
		$this->register_data();
	}

	protected function replace_elements_ids( $data ) {
		return Plugin::instance()->db->iterate_data( $data, function( $element ) {
			$element['id'] = Utils::generate_random_string();

			return $element;
		} );
	}

	/**
	 * @param array $data a set of elements
	 * @param string $method (on_export|on_import)
	 *
	 * @return mixed
	 */
	protected function process_export_import_data( $data, $method ) {
		return Plugin::instance()->db->iterate_data( $data, function( $element ) use ( $method ) {

			if ( 'widget' === $element['elType'] ) {
				$element_class = Plugin::instance()->widgets_manager->get_widget_types( $element['widgetType'] );
			} else {
				$element_class = Plugin::instance()->elements_manager->get_element_types( $element['elType'] );
			}

			// If the widget/element isn't exist, like a plugin that creates a widget but deactivated
			if ( ! $element_class ) {
				return $element;
			}

			if ( method_exists( $element_class, $method ) ) {
				$element = $element_class->{$method}( $element );
			}

			foreach ( $element_class->get_controls() as $control ) {
				$control_class = Plugin::instance()->controls_manager->get_control( $control['type'] );

				// If the control isn't exist, like a plugin that creates the control but deactivated
				if ( ! $control_class ) {
					return $element;
				}

				if ( method_exists( $control_class, $method ) ) {
					$element['settings'][ $control['name'] ] = $control_class->{$method}( $element['settings'][ $control['name'] ] );
				}
			}

			return $element;
		} );
	}
}
