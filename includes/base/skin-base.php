<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Skin Base
 *
 * Abstract class to register new skins to Elementor widgets. Skins allow you to
 * add new templates, set custom controls and more.
 *
 * To add skins to widgets use the `_register_skins()` method and register new
 * skins using `add_skin()` method.
 *
 * @abstract
 */
abstract class Skin_Base {

	/**
	 * Parent widget.
	 *
	 * Holds the parent widget of the skin. Default value is null, no parent widget.
	 *
	 * @access protected
	 *
	 * @var Widget_Base|null
	 */
	protected $parent = null;

	/**
	 * Skin base constructor.
	 *
	 * Initializing the skin base class by setting parent widget and registering
	 * controls actions.
	 *
	 * @param Widget_Base $parent
	 */
	public function __construct( Widget_Base $parent ) {
		$this->parent = $parent;

		$this->_register_controls_actions();
	}

	/**
	 * Retrieve skin ID.
	 *
	 * @access public
	 * @abstract
	 */
	abstract public function get_id();

	/**
	 * Retrieve skin title.
	 *
	 * @access public
	 * @abstract
	 */
	abstract public function get_title();

	/**
	 * Render skin.
	 *
	 * Generates the final HTML on the frontend.
	 *
	 * @access public
	 * @abstract
	 */
	abstract public function render();

	/**
	 * Render skin output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @access public
	 *
	 * @deprecated
	 */
	public function _content_template() {}

	/**
	 * Register skin controls actions.
	 *
	 * Run on init and used to register new skins to be injected to the widget.
	 * This method is used to register new actions that specify the locaion of
	 * the skin in the widget.
	 *
	 * Example usage:
	 * `add_action( 'elementor/element/{widget_id}/{section_id}/before_section_end', [ $this, 'register_controls' ] );`
	 *
	 * @access protected
	 */
	protected function _register_controls_actions() {}

	/**
	 * Retrieve skin control ID.
	 *
	 * Used to get the skin control ID. Note that skin controls have special
	 * prefix to destiguish them from regular controls, and from controls in
	 * other skins.
	 *
	 * @access protected
	 *
	 * @param string $control_base_id Control base ID.
	 *
	 * @return string Control ID.
	 */
	protected function get_control_id( $control_base_id ) {
		$skin_id = str_replace( '-', '_', $this->get_id() );
		return $skin_id . '_' . $control_base_id;
	}

	/**
	 * Retrieve skin settings.
	 *
	 * Get all the skin settings or, when requested, a specific setting.
	 *
	 * @TODO: rename to get_setting() and create backward compitability.
	 *
	 * @access public
	 *
	 * @param string $control_base_id Control base ID.
	 *
	 * @return Widget_Base Widget instance.
	 */
	public function get_instance_value( $control_base_id ) {
		$control_id = $this->get_control_id( $control_base_id );
		return $this->parent->get_settings( $control_id );
	}

	/**
	 * Start skin controls section.
	 *
	 * Used to add a new section of controls to the skin.
	 *
	 * @access public
	 *
	 * @param string $id   Section ID.
	 * @param array  $args Section arguments.
	 */
	public function start_controls_section( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->start_controls_section( $this->get_control_id( $id ), $args );
	}

	/**
	 * End skin controls section.
	 *
	 * Used to close an existing open skin controls section.
	 *
	 * @access public
	 */
	public function end_controls_section() {
		$this->parent->end_controls_section();
	}

	/**
	 * Add new skin control.
	 *
	 * Register a single control to the allow the user to set/update skin data.
	 *
	 * @access public
	 *
	 * @param string $id   Control ID.
	 * @param array  $args Control arguments.
	 *
	 * @return bool True if skin added, False otherwise.
	 */
	public function add_control( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		return $this->parent->add_control( $this->get_control_id( $id ), $args );
	}

	/**
	 * Update skin control.
	 *
	 * Change the value of an existing skin control.
	 *
	 * @access public
	 *
	 * @param string $id   Control ID.
	 * @param array  $args Control arguments. Only the new fields you want to update.
	 */
	public function update_control( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->update_control( $this->get_control_id( $id ), $args );
	}

	/**
	 * Remove skin control.
	 *
	 * Unregister an existing skin control.
	 *
	 * @access public
	 *
	 * @param string $id Control ID.
	 */
	public function remove_control( $id ) {
		$this->parent->remove_control( $this->get_control_id( $id ) );
	}

	/**
	 * Add new responsive skin control.
	 *
	 * Register a set of controls to allow editing based on user screen size.
	 *
	 * @access public
	 *
	 * @param string $id   Responsive control ID.
	 * @param array  $args Responsive control arguments.
	 */
	public function add_responsive_control( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->add_responsive_control( $this->get_control_id( $id ), $args );
	}

	/**
	 * Update responsive skin control.
	 *
	 * Change the value of an existing responsive skin control.
	 *
	 * @access public
	 *
	 * @param string $id   Responsive control ID.
	 * @param array  $args Responsive control arguments.
	 */
	public function update_responsive_control( $id, $args ) {
		$this->parent->update_responsive_control( $this->get_control_id( $id ), $args );
	}

	/**
	 * Remove responsive skin control.
	 *
	 * Unregister an existing skin responsive control.
	 *
	 * @access public
	 *
	 * @param string $id Responsive control ID.
	 */
	public function remove_responsive_control( $id ) {
		$this->parent->remove_responsive_control( $this->get_control_id( $id ) );
	}

	/**
	 * Start skin controls tab.
	 *
	 * Used to add a new tab inside a group of tabs.
	 *
	 * @access public
	 *
	 * @param string $id   Control ID.
	 * @param array  $args Control arguments.
	 */
	public function start_controls_tab( $id, $args ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->start_controls_tab( $this->get_control_id( $id ), $args );
	}

	/**
	 * End skin controls tab.
	 *
	 * Used to close an existing open controls tab.
	 *
	 * @access public
	 */
	public function end_controls_tab() {
		$this->parent->end_controls_tab();
	}

	/**
	 * Start skin controls tabs.
	 *
	 * Used to add a new set of tabs inside a section.
	 *
	 * @access public
	 *
	 * @param string $id Control ID.
	 */
	public function start_controls_tabs( $id ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->start_controls_tabs( $this->get_control_id( $id ) );
	}

	/**
	 * End skin controls tabs.
	 *
	 * Used to close an existing open controls tabs.
	 *
	 * @access public
	 */
	public function end_controls_tabs() {
		$this->parent->end_controls_tabs();
	}

	/**
	 * Add new group control.
	 *
	 * Register a set of related controls grouped together as a single unified
	 * control.
	 *
	 * @access public
	 *
	 * @param string $group_name Group control name.
	 * @param array  $args       Group control arguments. Default is an empty array.
	 */
	final public function add_group_control( $group_name, $args = [] ) {
		$args['name'] = $this->get_control_id( $args['name'] );
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->add_group_control( $group_name, $args );
	}

	/**
	 * Set parent widget.
	 *
	 * Used to define the parent widget of the skin.
	 *
	 * @access public
	 *
	 * @param Widget_Base $parent Parent widget.
	 */
	public function set_parent( $parent ) {
		$this->parent = $parent;
	}
}
