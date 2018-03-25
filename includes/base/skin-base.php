<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Skin Base.
 *
 * An abstract class to register new skins for Elementor widgets. Skins allows
 * you to add new templates, set custom controls and more.
 *
 * To register new skins for your widget use the `add_skin()` method inside the
 * widget's `_register_skins()` method.
 *
 * @since 1.0.0
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
	 * @since 1.0.0
	 * @access public
	 * @param Widget_Base $parent
	 */
	public function __construct( Widget_Base $parent ) {
		$this->parent = $parent;

		$this->_register_controls_actions();
	}

	/**
	 * Get skin ID.
	 *
	 * Retrieve the skin ID.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 */
	abstract public function get_id();

	/**
	 * Get skin title.
	 *
	 * Retrieve the skin title.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 */
	abstract public function get_title();

	/**
	 * Render skin.
	 *
	 * Generates the final HTML on the frontend.
	 *
	 * @since 1.0.0
	 * @access public
	 * @abstract
	 */
	abstract public function render();

	/**
	 * Render skin output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 1.0.0
	 * @deprecated 1.7.6
	 * @access public
	 */
	public function _content_template() {}

	/**
	 * Register skin controls actions.
	 *
	 * Run on init and used to register new skins to be injected to the widget.
	 * This method is used to register new actions that specify the location of
	 * the skin in the widget.
	 *
	 * Example usage:
	 * `add_action( 'elementor/element/{widget_id}/{section_id}/before_section_end', [ $this, 'register_controls' ] );`
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls_actions() {}

	/**
	 * Get skin control ID.
	 *
	 * Retrieve the skin control ID. Note that skin controls have special prefix
	 * to distinguish them from regular controls, and from controls in other
	 * skins.
	 *
	 * @since 1.0.0
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
	 * Get skin settings.
	 *
	 * Retrieve all the skin settings or, when requested, a specific setting.
	 *
	 * @since 1.0.0
	 * @TODO: rename to get_setting() and create backward compatibility.
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
	 * @since 1.3.0
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
	 * @since 1.3.0
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
	 * @since 1.0.0
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
	 * @since 1.3.0
	 * @since 1.8.1 New `$options` parameter added.
	 *
	 * @access public
	 *
	 * @param string $id      Control ID.
	 * @param array  $args    Control arguments. Only the new fields you want to update.
	 * @param array  $options Optional. Some additional options.
	 */
	public function update_control( $id, $args, array $options = [] ) {
		$args['condition']['_skin'] = $this->get_id();
		$this->parent->update_control( $this->get_control_id( $id ), $args, $options );
	}

	/**
	 * Remove skin control.
	 *
	 * Unregister an existing skin control.
	 *
	 * @since 1.3.0
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
	 * @since 1.0.5
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
	 * @since 1.3.5
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
	 * @since 1.3.5
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
	 * @since 1.5.0
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
	 * @since 1.5.0
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
	 * @since 1.5.0
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
	 * @since 1.5.0
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
	 * @since 1.0.0
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
	 * @since 1.0.0
	 * @access public
	 *
	 * @param Widget_Base $parent Parent widget.
	 */
	public function set_parent( $parent ) {
		$this->parent = $parent;
	}
}
