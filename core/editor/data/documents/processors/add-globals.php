<?php

namespace Elementor\Core\Editor\Data\Documents\Processors;

use Elementor\Data\Base\Processor;
use Elementor\Data\Manager;
use Elementor\Plugin;

class AddGlobals extends Processor\After {

	public function get_command() {
		return 'editor/documents/elements';
	}

	public function get_conditions( $args, $result ) {
		return isset( $args['element_id'] ) && isset( $result['settings']['__globals__'] ); // Single selection.
	}

	public function apply( $args, $result ) {
		$settings = &$result['settings'];
		$globals = $settings['__globals__'];

		$element_instance = Plugin::$instance->elements_manager->create_element_instance( $result );

		foreach ( $globals as $global_key => $global_value ) {
			// Means, the control default value were disabled.
			if ( ! $global_value ) {
				continue;
			}

			$data = Manager::instance()->run( $global_value );
			$control = $element_instance->get_controls( $global_key );
			$control_group_prefix = isset( $control['groupPrefix'] ) ? $control['groupPrefix'] : false;

			if ( $control_group_prefix ) {
				foreach ( $element_instance->get_controls() as $control ) {
					if ( isset( $control['groupPrefix'] ) && $control['groupPrefix'] === $control_group_prefix ) {
						$base_control_name = str_replace( $control['groupPrefix'], '', $control['name'] );

						if ( isset( $data['value'][ $base_control_name ] ) ) {
							$control_name = $control['name'];
							$settings[ $control_name ] = $data['value'][ $base_control_name ];
						}
					}
				}
			} else {
				$settings[ $global_key ] = $data['value'];
			}
		}

		return $result;
	}
}
