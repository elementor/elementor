<?php
namespace Elementor;

class Repeater extends Element_Base {

	private static $counter = 0;

	/**
	 * @since 1.0.7
	 * @access public
	*/
	public function __construct( array $data = [], array $args = null ) {
		self::$counter++;

		parent::__construct( $data, $args );
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public function get_name() {
		return 'repeater-' . self::$counter;
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function get_type() {
		return 'repeater';
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function add_control( $id, array $args, $options = [] ) {
		$current_tab = $this->get_current_tab();

		if ( null !== $current_tab ) {
			$args = array_merge( $args, $current_tab );
		}

		return Plugin::$instance->controls_manager->add_control_to_stack( $this, $id, $args, $options );
	}

	/**
	 * @since 1.5.0
	 * @access public
	*/
	public function get_fields() {
		return array_values( $this->get_controls() );
	}

	/**
	 * @since 1.0.0
	 * @access protected
	*/
	protected function _get_default_child_type( array $element_data ) {
		return false;
	}
}
