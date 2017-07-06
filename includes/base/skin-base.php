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

	public function start_controls_section( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->start_controls_section( $this->get_control_id( $id ), $args );
	}

	public function end_controls_section() {
		$this->parent->end_controls_section();
	}

	public function add_control( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		return $this->parent->add_control( $this->get_control_id( $id ), $args );
	}

	public function update_control( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->update_control( $this->get_control_id( $id ), $args );
	}

	public function remove_control( $id ) {
		$this->parent->remove_control( $this->get_control_id( $id ) );
	}

	public function add_responsive_control( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->add_responsive_control( $this->get_control_id( $id ), $args );
	}

	public function update_responsive_control( $id, $args ) {
		$this->parent->update_responsive_control( $this->get_control_id( $id ), $args );
	}

	public function remove_responsive_control( $id ) {
		$this->parent->remove_responsive_control( $this->get_control_id( $id ) );
	}

	public function start_controls_tab( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->start_controls_tab( $this->get_control_id( $id ), $args );
	}

	public function end_controls_tab() {
		$this->parent->end_controls_tab();
	}

	public function start_controls_tabs( $id ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->start_controls_tabs( $this->get_control_id( $id ) );
	}

	public function end_controls_tabs() {
		$this->parent->end_controls_tabs();
	}

	final public function add_group_control( $group_name, $args = [] ) {
		$args['name'] = $this->get_control_id( $args['name'] );
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->add_group_control( $group_name, $args );
	}

	public function set_parent( $parent ) {
		$this->parent = $parent;
	}
}
