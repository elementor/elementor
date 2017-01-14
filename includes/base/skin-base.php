<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Skin_Base {

	/**
	 * @var Widget_Base|null
	 */
	protected $parent = null;

	/**
	 * Skin_Base constructor.
	 *
	 * @param Widget_Base $parent
	 */
	public function __construct( Widget_Base $parent ) {
		$this->parent = $parent;

		$this->_register_controls_actions();
	}

	abstract public function get_id();

	abstract public function get_title();

	abstract public function render();

	public function _content_template() {}

	protected function _register_controls_actions() {}

	protected function get_control_id( $control_base_id ) {
		$skin_id = str_replace( '-', '_', $this->get_id() );
		return $skin_id . '_' . $control_base_id;
	}

	public function get_instance_value( $control_base_id ) {
		$control_id = $this->get_control_id( $control_base_id );
		return $this->parent->get_settings( $control_id );
	}

	public function add_control( $id, $args ) {
		return $this->parent->add_control( $this->get_control_id( $id ), $args );
	}

	public function add_responsive_control( $id, $args ) {
		$this->parent->add_responsive_control( $this->get_control_id( $id ), $args );
	}

	public final function add_group_control( $group_name, $args = [] ) {
		$args['name'] = $this->get_control_id( $args['name'] );

		$this->parent->add_group_control( $group_name, $args );
	}

	public function set_parent( $parent ) {
		$this->parent = $parent;
	}
}
