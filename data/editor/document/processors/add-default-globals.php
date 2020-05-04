<?php
namespace Elementor\Data\Editor\Document\Processors;

use Elementor\Data\Base\Processor;
use Elementor\Data\Manager as DataManager;
use Elementor\Plugin;

class AddDefaultGlobals extends Processor\After {
	public function get_command() {
		return 'document/elements';
	}

	public function get_conditions( $args, $result ) {
		return is_array( $result );
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
				if ( ! empty( $control['globals'] ) ) {
					$element_settings = & $elements[ $element_key ]['settings'];

					// Add default globals only when __globals__ does not exist.
					if ( ! isset( $element_settings['__globals__'] ) ) {
						$element_settings['__globals__'] = [];

						$element_settings['__globals__'][ $control_name ] = $control['globals'];
					}
				}
			}

			if ( isset( $element_model['elements'] ) && count( $element_model['elements'] ) ) {
				$this->add_globals_recursive( $element_model['elements'] );
			}
		}
	}
}
