<?php
namespace Elementor;

class Repeater extends Element_Base {

	function get_name() {
		return 'repeater';
	}

	public static function get_type() {
		return 'repeater';
	}

	function _get_child_type( array $element_data ) {
		return false;
	}

	public function add_control( $id, $args ) {
		if ( null !== $this->_current_tab ) {
			$args = array_merge( $args, $this->_current_tab );
		}

		return Plugin::instance()->controls_manager->add_control_to_stack( $this, $id, $args );
	}
}

