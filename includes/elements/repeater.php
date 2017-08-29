<?php
namespace Elementor;

class Repeater extends Element_Base {

	private static $counter = 0;

	public function __construct( array $data = [], array $args = null ) {
		self::$counter++;

		parent::__construct( $data, $args );
	}

	public function get_name() {
		return 'repeater-' . self::$counter;
	}

	public static function get_type() {
		return 'repeater';
	}

	public function add_control( $id, array $args, $options = [] ) {
		$current_tab = $this->get_current_tab();

		if ( null !== $current_tab ) {
			$args = array_merge( $args, $current_tab );
		}

		return Plugin::$instance->controls_manager->add_control_to_stack( $this, $id, $args, $options );
	}

	public function get_fields() {
		return array_values( $this->get_controls() );
	}

	protected function _get_default_child_type( array $element_data ) {
		return false;
	}
}
