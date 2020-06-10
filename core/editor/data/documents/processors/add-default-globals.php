<?php

namespace Elementor\Core\Editor\Data\Documents\Processors;

use Elementor\Data\Base\Processor;
use Elementor\Plugin;

// TODO: Delete - handle in frontend.

class AddDefaultGlobals extends Processor\After {

	public function get_command() {
		return 'editor/documents/elements';
	}

	public function get_conditions( $args, $result ) {
		return isset( $args['document_id'] ) && ! isset( $args['element_id'] );
	}

	public function apply( $args, $result ) {
		$this->add_globals_recursive( $result );

		return $result;
	}

	private function add_globals_recursive( &$elements ) {
		foreach ( $elements as $element_key => &$element_model ) {
			$element_instance = Plugin::$instance->elements_manager->create_element_instance( $element_model );
			$element_controls = $element_instance->get_controls();

			foreach ( $element_controls as $control_name => $control ) {
				if ( ! empty( $control['global']['default'] ) ) {
					$element_settings = &$elements[ $element_key ]['settings'];

					// Add default globals only when __globals__ does not exist.
					if ( ! isset( $element_settings['__globals__'] ) ) {
						$element_settings['__globals__'] = [];

						$element_settings['__globals__'][ $control_name ] = $control['global'];
					}
				}
			}

			if ( isset( $element_model['elements'] ) && count( $element_model['elements'] ) ) {
				$this->add_globals_recursive( $element_model['elements'] );
			}
		}
	}
}
